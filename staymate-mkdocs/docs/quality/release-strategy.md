# Release Strategy

Versioning and release process.

---

## Semantic Versioning

```
MAJOR.MINOR.PATCH
1.2.3
```

| Type | When |
|------|------|
| MAJOR | Breaking changes |
| MINOR | New features |
| PATCH | Bug fixes |

---

## Release Process

1. Update version in `pom.xml`
2. Update CHANGELOG.md
3. Create tag: `git tag v1.2.3`
4. Push release
