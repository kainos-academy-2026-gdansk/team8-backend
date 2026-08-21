Feature: Applying for a job role
  As an authenticated employee
  I want to apply for an open internal job role
  So that my application is registered for review

  Background:
    Given I am authenticated as user 10

  Scenario: Successfully applying for an open job role
    Given job role 1 is "OPEN" with 2 open positions
    When I apply for job role 1 with CV "encoded-cv"
    Then the response status should be 201
    And the response should contain an application for job role 1 with status "IN_PROGRESS"
    And the stored applications should be exactly 1 for job role 1 with status "IN_PROGRESS"

  Scenario: Applying twice for the same job role
    Given job role 1 is "OPEN" with 2 open positions
    And I have already applied for job role 1
    When I apply for job role 1 with CV "encoded-cv"
    Then the response status should be 409
    And the response error should be "Application already exists for this job role"
    And the stored applications should be exactly 1 for job role 1 with status "IN_PROGRESS"

  Scenario Outline: Applying for a job role that is not accepting applications
    Given job role 1 is "<status>" with <positions> open positions
    When I apply for job role 1 with CV "encoded-cv"
    Then the response status should be 423
    And the response error should be "Job role is not available for applications"

    Examples:
      | status | positions |
      | CLOSED | 2         |
      | OPEN   | 0         |

  Scenario: Applying for a job role that does not exist
    Given no job roles exist
    When I apply for job role 999 with CV "encoded-cv"
    Then the response status should be 404
    And the response error should be "Job role not found"

  Scenario: Applying with an empty CV
    Given job role 1 is "OPEN" with 2 open positions
    When I apply for job role 1 with CV ""
    Then the response status should be 400
    And the response error should be "Invalid request body"

  Scenario: Applying with a CV that exceeds the allowed length
    Given job role 1 is "OPEN" with 2 open positions
    When I apply for job role 1 with a CV of 5001 characters
    Then the response status should be 400
    And the response error should be "Invalid request body"

  Scenario: Applying without an authentication token
    Given I am not authenticated
    And job role 1 is "OPEN" with 2 open positions
    When I apply for job role 1 with CV "encoded-cv"
    Then the response status should be 401

  Scenario: Applying with an invalid job role id
    Given job role 1 is "OPEN" with 2 open positions
    When I apply for job role "abc" with CV "encoded-cv"
    Then the response status should be 400

  @mocked-only
  Scenario: Losing a race with a concurrent duplicate application
    Given job role 1 is "OPEN" with 2 open positions
    And the application store rejects the write as a duplicate
    When I apply for job role 1 with CV "encoded-cv"
    Then the response status should be 409
    And the response error should be "Application already exists for this job role"

  @mocked-only
  Scenario: Application store is unavailable
    Given job role 1 is "OPEN" with 2 open positions
    And the application store fails unexpectedly
    When I apply for job role 1 with CV "encoded-cv"
    Then the response status should be 500
    And the response error should be "Failed to create application"
