#!/bin/bash

# --- CONFIG ---
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
DB_SCHEMA="$PROJECT_ROOT/db/schema.sql"
DB_DATA="$PROJECT_ROOT/db/data.sql"
API_URL="http://localhost:3000/api"
DB_USER="${DB_USER:-root}"
DB_HOST="${DB_HOST:-localhost}"
TEST_DB="dinux_test"
PASS=0
FAIL=0

# --- PASSWORD HANDLING ---
if [ -n "$1" ]; then
  DB_PASSWORD="$1"
fi

if [ -n "$DB_PASSWORD" ]; then
  DB_PASS_OPT="-p$DB_PASSWORD"
else
  DB_PASS_OPT=""
fi

# --- DROP AND RECREATE TEST DB ---
echo "Dropping and recreating test database '$TEST_DB'..."

# create temp schema file with test db name
TEMP_SCHEMA=$(mktemp)
sed "s/dinux\b/$TEST_DB/g" "$DB_SCHEMA" > "$TEMP_SCHEMA"

mariadb -u"$DB_USER" $DB_PASS_OPT -h"$DB_HOST" -e "DROP DATABASE IF EXISTS $TEST_DB"
mariadb -u"$DB_USER" $DB_PASS_OPT -h"$DB_HOST" < "$TEMP_SCHEMA"
mariadb -u"$DB_USER" $DB_PASS_OPT -h"$DB_HOST" "$TEST_DB" < "$DB_DATA"
rm "$TEMP_SCHEMA"

# --- FUNCTIONS ---
function wait_for_backend() {
  echo "Waiting for backend to be ready..."
  for i in {1..20}; do
    if curl -s "$API_URL/dinos" >/dev/null; then
      echo "Backend is up!"
      return 0
    fi
    sleep 1
  done
  echo "Backend did not start in time."
  exit 1
}

function check_success() {
  local json="$1"
  local label="$2"
  local expect="$3"
  local ok=$(echo "$json" | jq -r '.success')
  if [ "$ok" == "$expect" ]; then
    echo -e "\033[0;32m[PASS]\033[0m $label"
    PASS=$((PASS+1))
  else
    echo -e "\033[0;31m[FAIL]\033[0m $label"
    FAIL=$((FAIL+1))
    echo "$json" | jq
  fi
}

function api_call() {
  local method="$1"
  local endpoint="$2"
  local token="$3"
  local data="$4"
  local cmd="curl -s -X $method $API_URL$endpoint"
  if [ -n "$token" ]; then
    cmd="$cmd -H \"Authorization: Bearer $token\""
  fi
  if [ -n "$data" ]; then
    cmd="$cmd -H \"Content-Type: application/json\" -d '$data'"
  fi
  eval $cmd
}

function test_positive() {
  local method="$1"
  local endpoint="$2"
  local label="$3"
  local token="$4"
  local data="$5"
  OUT=$(api_call "$method" "$endpoint" "$token" "$data")
  check_success "$OUT" "$label" "true"
}

function test_negative() {
  local method="$1"
  local endpoint="$2"
  local label="$3"
  local token="$4"
  local data="$5"
  OUT=$(api_call "$method" "$endpoint" "$token" "$data")
  check_success "$OUT" "$label" "false"
}

# --- MAIN LOGIC ---
cd "$PROJECT_ROOT" || exit 1

echo "Starting backend with NODE_ENV=test..."
cd "$BACKEND_DIR" || exit 1
NODE_ENV=test nohup npm run dev > /dev/null 2>&1 &
BACKEND_PID=$!
cd "$PROJECT_ROOT" || exit 1

trap "kill $BACKEND_PID" EXIT

wait_for_backend

# --- TESTS ---

echo "Register test user..."
test_positive "POST" "/register" "Register test user" "" '{"username":"apitestuser","email":"apitestuser@example.com","password":"apitestpass"}'

USER_LOGIN=$(api_call "POST" "/login" "" '{"username":"apitestuser","password":"apitestpass"}')
check_success "$USER_LOGIN" "Login as test user" "true"
USER_TOKEN=$(echo "$USER_LOGIN" | jq -r '.data.token')
USER_ID=$(echo "$USER_LOGIN" | jq -r '.data.user.id')
if [ -z "$USER_TOKEN" ] || [ "$USER_TOKEN" == "null" ]; then
  echo "[FAIL] User login failed! Exiting."
  exit 1
fi

ADMIN_LOGIN=$(api_call "POST" "/login" "" '{"username":"admin","password":"admin"}')
check_success "$ADMIN_LOGIN" "Login as admin" "true"
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.data.token')
if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  echo "[FAIL] Admin login failed! Exiting."
  exit 1
fi

# --- DUPLICATE REGISTRATION TESTS ---
test_negative "POST" "/register" "Register user with duplicate email" "" '{"username":"apitestuser2","email":"apitestuser@example.com","password":"apitestpass"}'
test_negative "POST" "/register" "Register user with duplicate username" "" '{"username":"apitestuser","email":"apitestuser2@example.com","password":"apitestpass"}'

# --- FUNCTIONAL TESTS ---

test_positive "GET" "/dinos" "GET /dinos"
test_positive "GET" "/dinos/1" "GET /dinos/1"
test_positive "GET" "/spiecieses" "GET /spiecieses"
test_positive "GET" "/tierlist" "GET /tierlist"

test_positive "POST" "/favorites" "POST /favorites" "$USER_TOKEN" '{"dinoId":1}'
test_positive "GET" "/favorites" "GET /favorites" "$USER_TOKEN"
test_positive "DELETE" "/favorites/1" "DELETE /favorites/1" "$USER_TOKEN"
test_positive "PUT" "/users/update" "PUT /users/update" "$USER_TOKEN" '{"username":"apitestuser2"}'

test_positive "GET" "/vote/1?sessionId=1" "GET /vote/1" "$USER_TOKEN"

# --- VOTE SESSIONS MINE TESTS ---
test_positive "GET" "/vote/sessions/mine" "GET /vote/sessions/mine (empty)" "$USER_TOKEN"
test_positive "POST" "/vote/1" "POST /vote/1" "$USER_TOKEN" '{"sessionId":1}'
test_positive "GET" "/vote/sessions/mine" "GET /vote/sessions/mine (after voting)" "$USER_TOKEN"
test_negative "POST" "/vote/1" "POST /vote/1 (duplicate vote)" "$USER_TOKEN" '{"sessionId":1}'

# Admin dino CRUD
NEW_DINO=$(api_call "POST" "/admin/dinos" "$ADMIN_TOKEN" '{"name":"APITestDino","species_id":1,"description":"Test dino","era_id":1,"diet_id":1,"size":"5m","weight":"500kg","image_url":"apitest.jpg","categories":[1],"environments":[1]}')
check_success "$NEW_DINO" "POST /admin/dinos" "true"
NEW_DINO_ID=$(echo "$NEW_DINO" | jq -r '.data.id')

test_positive "PUT" "/admin/dinos/$NEW_DINO_ID" "PUT /admin/dinos/$NEW_DINO_ID" "$ADMIN_TOKEN" '{"name":"APITestDinoUpdated"}'
test_positive "DELETE" "/admin/dinos/$NEW_DINO_ID" "DELETE /admin/dinos/$NEW_DINO_ID" "$ADMIN_TOKEN"

test_positive "GET" "/admin/users" "GET /admin/users" "$ADMIN_TOKEN"
test_positive "PUT" "/admin/users/$USER_ID/status" "PUT /admin/users/$USER_ID/status" "$ADMIN_TOKEN" '{"role":"user"}'
test_positive "PUT" "/admin/users/$USER_ID/reset-password" "PUT /admin/users/$USER_ID/reset-password" "$ADMIN_TOKEN"

# Admin vote CRUD
NEW_VOTE=$(api_call "POST" "/admin/vote" "$ADMIN_TOKEN" '{"title":"API Test Voting","description":"Vote for the best!"}')
check_success "$NEW_VOTE" "POST /admin/vote" "true"
NEW_VOTE_ID=$(echo "$NEW_VOTE" | jq -r '.sessionId')

test_positive "PUT" "/admin/vote/$NEW_VOTE_ID" "PUT /admin/vote/$NEW_VOTE_ID" "$ADMIN_TOKEN" '{"title":"API Test Voting Updated"}'
test_positive "DELETE" "/admin/vote/$NEW_VOTE_ID" "DELETE /admin/vote/$NEW_VOTE_ID" "$ADMIN_TOKEN"
test_positive "GET" "/admin/vote" "GET /admin/vote" "$ADMIN_TOKEN"

test_positive "DELETE" "/users/delete" "DELETE /users/delete" "$USER_TOKEN"

# --- NEGATIVE TESTS ---
test_negative "POST" "/admin/dinos" "Unlogged user forbidden on POST /admin/dinos" "" '{"name":"ShouldFail","species_id":1,"description":"fail","era_id":1,"diet_id":1,"size":"1m","weight":"1kg","image_url":"fail.jpg","categories":[1],"environments":[1]}'
test_negative "POST" "/admin/dinos" "Normal user forbidden on POST /admin/dinos" "$USER_TOKEN" '{"name":"ShouldFail","species_id":1,"description":"fail","era_id":1,"diet_id":1,"size":"1m","weight":"1kg","image_url":"fail.jpg","categories":[1],"environments":[1]}'
test_negative "GET" "/admin/users" "Normal user forbidden on GET /admin/users" "$USER_TOKEN"
test_negative "GET" "/admin/users" "Unlogged user forbidden on GET /admin/users" ""

echo -e "\nALL TESTS DONE"
echo "-----------------------------"
echo "Passed: $PASS"
echo "Failed: $FAIL"
if [ "$FAIL" -eq 0 ]; then
  echo -e "\033[0;32mPASSED!\033[0m"
else
  echo -e "\033[0;31mFAILED!\033[0m"
fi

# backend will be stopped by the trap on exit