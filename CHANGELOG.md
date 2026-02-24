# Changelog

## [0.0.36] - 2025-02-24

### Fixed

- **Permissions from customAttributes**: AuthService now reads roles (operator, admin, sudo, trainer) from token claim `customAttributes` when the direct role claim is not set. Supports both JSON string and object. Fixes trainer panel access when backend stores roles in customAttributes only.
- **refreshToken()**: After refreshing the ID token, permissions are re-applied from the new token so `isTrainer()` / `isAdmin()` etc. reflect the updated claims immediately after login.
