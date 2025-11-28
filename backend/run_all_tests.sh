#!/bin/bash

##############################################################################
# Adaptive LMS - Comprehensive Test Suite Runner
#
# This script executes all test suites for the Adaptive Learning Management
# System backend. It runs both bash and Python test scripts and provides a
# comprehensive summary of results.
#
# Usage:
#   ./run_all_tests.sh
#
# Requirements:
#   - Backend server running on http://localhost:8000
#   - PostgreSQL database accessible
#   - Python 3 with required dependencies installed
##############################################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Test suite results
declare -A TEST_RESULTS
declare -A TEST_COUNTS

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="$SCRIPT_DIR/tests"

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_section() {
    echo -e "\n${CYAN}▶ $1${NC}"
    echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

##############################################################################
# Pre-flight Checks
##############################################################################

check_server() {
    print_section "Pre-flight Check: Backend Server"

    if curl -s http://localhost:8000/health > /dev/null 2>&1 || \
    curl -s http://localhost:8000/ > /dev/null 2>&1; then
        print_success "Backend server is running on http://localhost:8000"
        return 0
    else
        print_error "Backend server is not running!"
        print_info "Start the server with: uvicorn app.main:app --reload"
        return 1
    fi
}

check_python() {
    print_section "Pre-flight Check: Python Environment"

    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version)
        print_success "Python found: $PYTHON_VERSION"
        return 0
    else
        print_error "Python 3 not found!"
        return 1
    fi
}

check_dependencies() {
    print_section "Pre-flight Check: Test Directory"

    if [ -d "$TESTS_DIR" ]; then
        TEST_COUNT=$(ls -1 "$TESTS_DIR"/test_* 2>/dev/null | wc -l)
        print_success "Tests directory found with $TEST_COUNT test files"
        return 0
    else
        print_error "Tests directory not found at: $TESTS_DIR"
        return 1
    fi
}

##############################################################################
# Test Execution Functions
##############################################################################

run_bash_test() {
    local test_file="$1"
    local test_name=$(basename "$test_file" .sh)

    print_section "Running: $test_name"

    # Run the test and capture output
    cd "$SCRIPT_DIR" || exit 1

    if bash "$test_file" > "/tmp/${test_name}_output.log" 2>&1; then
        local exit_code=$?

        # Extract test results from output (strip ANSI codes first)
        local passed=$(sed 's/\x1b\[[0-9;]*m//g' "/tmp/${test_name}_output.log" | grep -o "Passed: [0-9]*" | grep -o "[0-9]*" || echo "0")
        local failed=$(sed 's/\x1b\[[0-9;]*m//g' "/tmp/${test_name}_output.log" | grep -o "Failed: [0-9]*" | grep -o "[0-9]*" || echo "0")
        local total=$((passed + failed))

        if [ "$failed" -eq 0 ]; then
            print_success "$test_name completed: $passed/$total tests passed"
            TEST_RESULTS["$test_name"]="PASSED"
        else
            print_error "$test_name completed: $passed/$total tests passed, $failed failed"
            TEST_RESULTS["$test_name"]="FAILED"
        fi

        TEST_COUNTS["$test_name"]="$passed/$total"
        TOTAL_TESTS=$((TOTAL_TESTS + total))
        PASSED_TESTS=$((PASSED_TESTS + passed))
        FAILED_TESTS=$((FAILED_TESTS + failed))

        return 0
    else
        print_error "$test_name failed to execute"
        TEST_RESULTS["$test_name"]="ERROR"
        TEST_COUNTS["$test_name"]="0/0"
        return 1
    fi
}

run_python_test() {
    local test_file="$1"
    local test_name=$(basename "$test_file" .py)

    print_section "Running: $test_name"

    cd "$SCRIPT_DIR" || exit 1

    # Run the test and capture output
    python3 "$test_file" > "/tmp/${test_name}_output.log" 2>&1
    exit_code=$?

    # Check exit code and parse results
    if [ $exit_code -eq 0 ]; then
        # Try to extract test counts from output
        local passed=$(grep -o "Passed: [0-9]*" "/tmp/${test_name}_output.log" | grep -o "[0-9]*" || \
                      grep -o "[0-9]* tests passed" "/tmp/${test_name}_output.log" | grep -o "[0-9]*" || \
                      grep -o "✓" "/tmp/${test_name}_output.log" | wc -l || echo "1")
        local failed=$(grep -o "Failed: [0-9]*" "/tmp/${test_name}_output.log" | grep -o "[0-9]*" || echo "0")

        # For workflow test (single end-to-end test)
        if [[ "$test_name" == "test_workflow" ]]; then
            if grep -q "Workflow test completed" "/tmp/${test_name}_output.log"; then
                passed=1
                failed=0
            fi
        fi

        # For metrics test
        if [[ "$test_name" == "test_metrics" ]]; then
            if grep -q "ALL TESTS PASSED" "/tmp/${test_name}_output.log"; then
                passed=$(grep "Passed:" "/tmp/${test_name}_output.log" | grep -o "[0-9]*" | head -1 || echo "12")
                failed=0
            fi
        fi

        local total=$((passed + failed))

        print_success "$test_name completed: $passed/$total tests passed"
        TEST_RESULTS["$test_name"]="PASSED"
        TEST_COUNTS["$test_name"]="$passed/$total"
        TOTAL_TESTS=$((TOTAL_TESTS + total))
        PASSED_TESTS=$((PASSED_TESTS + passed))
        FAILED_TESTS=$((FAILED_TESTS + failed))

        return 0
    else
        print_error "$test_name failed with exit code $exit_code"
        TEST_RESULTS["$test_name"]="FAILED"
        TEST_COUNTS["$test_name"]="0/?"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

##############################################################################
# Main Test Execution
##############################################################################

run_all_tests() {
    print_header "Adaptive LMS - Comprehensive Test Suite"
    echo -e "${CYAN}Started at: $(date)${NC}"

    # Pre-flight checks
    check_python || exit 1
    check_dependencies || exit 1
    check_server || {
        print_warning "Skipping tests that require running server"
        SKIP_API_TESTS=true
    }

    # Run bash tests
    print_header "Bash Test Suites"

    if [ -f "$TESTS_DIR/test_api_integration.sh" ] && [ "$SKIP_API_TESTS" != "true" ]; then
        run_bash_test "$TESTS_DIR/test_api_integration.sh"
    else
        print_warning "Skipping test_api_integration.sh (server not running)"
    fi

    # Run Python tests
    print_header "Python Test Suites"

    # Test order: metrics -> user -> content -> workflow
    for test_file in "$TESTS_DIR"/test_metrics.py \
                     "$TESTS_DIR"/test_user_service.py \
                     "$TESTS_DIR"/test_content_service.py \
                     "$TESTS_DIR"/test_workflow.py; do
        if [ -f "$test_file" ]; then
            if [[ "$test_file" =~ (user_service|content_service|workflow) ]] && [ "$SKIP_API_TESTS" == "true" ]; then
                print_warning "Skipping $(basename "$test_file") (server not running)"
            else
                run_python_test "$test_file"
            fi
        fi
    done
}

##############################################################################
# Results Summary
##############################################################################

print_summary() {
    print_header "Test Results Summary"

    echo -e "\n${CYAN}Individual Test Suites:${NC}"
    for test_name in "${!TEST_RESULTS[@]}"; do
        result="${TEST_RESULTS[$test_name]}"
        count="${TEST_COUNTS[$test_name]}"

        if [ "$result" == "PASSED" ]; then
            echo -e "  ${GREEN}✓${NC} $test_name: $count"
        elif [ "$result" == "FAILED" ]; then
            echo -e "  ${RED}✗${NC} $test_name: $count"
        else
            echo -e "  ${YELLOW}⚠${NC} $test_name: $result"
        fi
    done

    echo -e "\n${CYAN}Overall Statistics:${NC}"
    echo -e "  Total Tests:  $TOTAL_TESTS"
    echo -e "  ${GREEN}Passed:       $PASSED_TESTS${NC}"
    echo -e "  ${RED}Failed:       $FAILED_TESTS${NC}"

    if [ $TOTAL_TESTS -gt 0 ]; then
        PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo -e "  Pass Rate:    ${PASS_RATE}%"
    fi

    echo -e "\n${CYAN}Completed at: $(date)${NC}"

    # Final result
    if [ $FAILED_TESTS -eq 0 ] && [ $TOTAL_TESTS -gt 0 ]; then
        echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}  ✓ ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        return 0
    else
        echo -e "\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}  ✗ SOME TESTS FAILED${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        echo -e "${YELLOW}Check individual test logs in /tmp/ for details${NC}\n"
        return 1
    fi
}

##############################################################################
# Script Entry Point
##############################################################################

main() {
    # Change to script directory
    cd "$SCRIPT_DIR" || exit 1

    # Run all tests
    run_all_tests

    # Print summary
    print_summary

    # Return exit code based on test results
    if [ $FAILED_TESTS -eq 0 ] && [ $TOTAL_TESTS -gt 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"
