# allegro-actions/require-issue

This action ensures that there is a valid issue in comment

## Basic usage:

```
steps:
  - uses: allegro-actions/require-issue@v1
    with:
      host: jira.allegro
      token: personal-access-token
```

## Inputs

`type` - type of issue tracker - default - `jira`
