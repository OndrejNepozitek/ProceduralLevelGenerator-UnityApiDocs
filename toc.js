var fs = require('fs');
var yaml = require('js-yaml');

function transformToc(path) {
    var toc = yaml.safeLoad(fs.readFileSync(path));
    const util = require('util')

    var namespaces = {};

    for(var i=0; i<toc.length; i++) {
        var currentToc = toc[i];
        toc[i].name = toc[i].name.replace("Edgar.Unity.", "");
        console.log(toc[i].name)
    }

    // console.log(toc)

    for(var i=0; i<toc.length; i++) {
        var fullNamespace = toc[i].uid;
        var package = "Edgar.Unity";
        var packageName = "Core";

        if (fullNamespace.startsWith("Edgar.Unity.Examples")) {
            package = "Edgar.Unity.Examples"; 
            packageName = "Examples";
        }

        if (fullNamespace.startsWith("Edgar.Unity.Editor")) {
            package = "Edgar.Unity.Editor"; 
            packageName = "Editor";
        }

        if (fullNamespace.startsWith("Edgar.Unity.Tests")) {
            package = "Edgar.Unity.Tests"; 
            packageName = "Tests";
        }

        if (fullNamespace == package) {
            var namespaceWithoutPackage = "";
        } else {
            var namespaceWithoutPackage = fullNamespace.replace(package + ".", "");
        }

        

        if (namespaces[package] == undefined) {
            namespaces[package] = {
                name: packageName,
                uid: package,
                nested: {},
            }
        }

        var parent = namespaces[package];

        if (namespaceWithoutPackage !== "") {
            var splitnamespace = namespaceWithoutPackage.split('.');

            for(var j = 0; j < splitnamespace.length; j++) {
                var partialnamespace = splitnamespace[j];
    
                if(parent.nested[partialnamespace] == undefined) {
                    parent.nested[partialnamespace] = {
                        name: partialnamespace,
                        uid: parent.uid + "." + partialnamespace,
                        nested: {},
                    };
                }
                parent = parent.nested[partialnamespace];
            }
        }


        if(parent.items == undefined) {
            parent.items = toc[i].items;
        }
        else {
            parent.items.push(toc[i]);
        }
    }

    /*console.log(namespaces)
    console.log(util.inspect(namespaces, {showHidden: false, depth: null}))*/

    console.log(util.inspect(namespaces, false, null, true /* enable colors */))

    function recurse(namespace) {
        var items = namespace.items || [];

        if (namespace.nested) {
            Object.keys(namespace.nested).forEach(key => {
                items.push(recurse(namespace.nested[key]));
            });
        }

        return {
            name: namespace.name,
            uid: namespace.uid,
            items,
        };
    }

    var items = []
    
    items.push(recurse(namespaces["Edgar.Unity"]))
    items.push(recurse(namespaces["Edgar.Unity.Editor"]))
    items.push(recurse(namespaces["Edgar.Unity.Examples"]))
    items.push(recurse(namespaces["Edgar.Unity.Tests"]))

    // console.log(util.inspect(items, false, null, true /* enable colors */))

    fs.writeFileSync(path, yaml.safeDump(items));
    // fs.writeFileSync('./toc_new.yml', yaml.safeDump(items));
}

transformToc('./versions/master/api/toc.yml');
transformToc('./versions/dev/api/toc.yml');
