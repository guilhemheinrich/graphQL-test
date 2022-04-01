type prefix_array = {prefix: string, uri: string}[]
const uri_separator = new RegExp(/(^.*[\/#])([\d\w]*)$/gm)

function find_or_add(uri: string, prefix_array: prefix_array) {
    for (let prefix_uri of prefix_array) {
        if (uri.startsWith(prefix_uri.uri)) {
            return uri.replace(prefix_uri.uri, prefix_uri.prefix + ':')
        }
    }
    // Todo:
    // else add the uri with a newly created prefix
    let matches = uri.matchAll(uri_separator)
    const _array = Array.from(matches)
    
}