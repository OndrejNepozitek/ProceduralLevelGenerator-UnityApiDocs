var fs = require('fs');
var yaml = require('js-yaml');

function transformToc(path) {
    var toc = yaml.safeLoad(fs.readFileSync(path));
    const util = require('util')

    var namespaces = {};

    for(var i=0; i<toc.length; i++) {
        var currentToc = toc[i];
        toc[i].name = toc[i].name.replace("ProceduralLevelGenerator.Unity.", "");
        console.log(toc[i].name)
    }

    // console.log(toc)

    for(var i=0; i<toc.length; i++) {
        var fullNamespace = toc[i].uid;
        var package = "ProceduralLevelGenerator.Unity";
        var packageName = "Core";

        if (fullNamespace.startsWith("ProceduralLevelGenerator.Unity.Examples")) {
            package = "ProceduralLevelGenerator.Unity.Examples"; 
            packageName = "Examples";
        }

        if (fullNamespace.startsWith("ProceduralLevelGenerator.Unity.Editor")) {
            package = "ProceduralLevelGenerator.Unity.Editor"; 
            packageName = "Editor";
        }

        if (fullNamespace.startsWith("ProceduralLevelGenerator.Unity.Tests")) {
            package = "ProceduralLevelGenerator.Unity.Tests"; 
            packageName = "Tests";
        }

        var fullnamespace = toc[i].uid.replace("ProceduralLevelGenerator.Unity.", "");

        var namespaceWithoutPackage = fullNamespace.replace(package + ".", "");
        var splitnamespace = namespaceWithoutPackage.split('.');

        if (namespaces[package] == undefined) {
            namespaces[package] = {
                name: packageName,
                uid: package,
                nested: {},
            }
        }

        var parent = namespaces[package];

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

    var newToc = [];

    /*function recurse(obj, path="") {
        var items = [];
        Object.keys(obj).forEach((e, i)=>{
            if(e!="items") {
                var newPath;
                if(path=="") {
                    newPath = e;
                }
                else {
                    newPath = path + '.' + e;
                }

                // name = newPath.replace("ProceduralLevelGenerator.Unity.", "");
                // newpath = "ProceduralLevelGenerator.Unity." + newPath;
                name = undefined

                var newObj = {uid: newPath, name: name || newPath, items: obj[e].items || []}
                newObj.items.push(...recurse(obj[e], newPath));
                items.push(newObj);
            }
        });
        return items;
    }*/

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

    var items = recurse(namespaces);

    var items = []
    items.push(recurse(namespaces["ProceduralLevelGenerator.Unity"], "ProceduralLevelGenerator.Unity"))
    items.push(recurse(namespaces["ProceduralLevelGenerator.Unity.Editor"], "ProceduralLevelGenerator.Unity"))
    items.push(recurse(namespaces["ProceduralLevelGenerator.Unity.Examples"], "ProceduralLevelGenerator.Unity"))
    items.push(recurse(namespaces["ProceduralLevelGenerator.Unity.Tests"], "ProceduralLevelGenerator.Unity"))

    // console.log(util.inspect(items, false, null, true /* enable colors */))

    fs.writeFileSync(path, yaml.safeDump(items));
    // fs.writeFileSync('./toc_new.yml', yaml.safeDump(items));
}

transformToc('./versions/master/api/toc.yml');
transformToc('./versions/dev/api/toc.yml');
