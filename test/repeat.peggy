url "not really a URL, just testing repeats" = "http://" label|1..127, "."| (digit|1..5| ":")? "/" path|.., "/"| ("?" (name "=" value)|min..{return max}, "&" " "*|)? ("#" frag|min..{return max}|)?
