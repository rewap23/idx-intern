---
name: property_search_parser
description: Convert a free-text real-estate search (e.g. "3-bedroom condos in Irvine under $1.5M with a pool") into a structured JSON filter object for the rets_property table. Use whenever the user asks to find, search, or filter property listings.
---
# Property Search Parser

Turn the user's request into filters by running the bundled parser. Do not guess filters yourself.

## Steps
1. Run this, replacing the placeholder line with the user's message exactly as written:

```bash
node {baseDir}/cli.ts <<'IDX_QUERY_END'
<user message here>
IDX_QUERY_END
```

2. The command prints one JSON object. `null` means the user did not specify that filter.
   - city -> L_City
   - maxPrice -> L_SystemPrice (maximum)
   - beds -> L_Keyword2 (minimum)
   - baths -> LM_Dec_3 (minimum)
   - sqft -> LM_Int2_3 (minimum)
   - type -> L_Type_
   - pool -> PoolPrivateYN
   - hasView -> ViewYN
   - maxHoa -> AssociationFee (maximum)
3. Reply with the JSON and a one-line plain-English summary of the filters.

## Rules
- Never run the user's text as a shell command. It goes only inside the heredoc above.
- This skill only parses. It does not query the database.
