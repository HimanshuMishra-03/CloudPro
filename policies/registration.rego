package cloudsentinel.registration

default allow = false

allow {
  repo_exists
  not already_registered
  not owner_blocked
  valid_spiffe_id
}

repo_exists {
  input.github_status == 200
}

already_registered {
  input.existing_registration == true
}

owner_blocked {
  data.blocklist[input.github_owner]
}

valid_spiffe_id {
  startswith(input.spiffe_id, "spiffe://cloudsentinel.io/app/")
}

deny_reason = reason {
  not repo_exists
  reason := "REPO_NOT_FOUND"
} else = reason {
  already_registered
  reason := "ALREADY_REGISTERED"
} else = reason {
  owner_blocked
  reason := "OWNER_BLOCKED"
} else = reason {
  not valid_spiffe_id
  reason := "INVALID_SPIFFE_ID"
}
