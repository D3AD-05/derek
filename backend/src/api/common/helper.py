def expand_if_requested(expand_key, expand_set, value, out_schema):
    if expand_key not in expand_set:
        return None
    return out_schema.model_validate(value).model_dump() if value else None
