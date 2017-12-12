# neprest

Neprest is a framework for creating REST APIs using Node, Express and Postgres. It is written in typescript and inspired by Angular 2+.

## What are the dependencies?

Aside from Node.js, neprest requires `express` and `pg` to operate. It also requires the body-parser express plugin for handling posted JSON data.

## How do I use it?

To start a new API, instantiate a module using the `@NepModule` decorator. Throughout this readme, question marks are used after object property
names to indicate that they're optional properties of those objects.

    @NepModule({
        handlers,
        app,
        pool,
        path?,
    })
    class MyAPI {

    }

`handlers` is an array of NepHandler classes, which we'll come to in a moment. `app` is your express app, and `pool` is a `pg` pool.

The methods of your NepModule class will eb applied as middleware to all requests received to endpoints in the module. The module definition
can also take an additional `path` parameter, which will be the base bath for requests. This can be useful for versioning, or if your API
will use multiple databases and you'd like the routing to reflect that.

The handlers array is, as mentioned, an array of NepHandler classes. Handler classes explain how the API interacts with a given table in the
database. You can use multiple handler classes for a single table but most of the time this isn't really necessary.

    @NepHandler({
        table: 'people', // actual name of table
        schema: Schema,
        alias?: 'folks', // optional parameter that is used for routing
    })
    class TableHandler {

        @NepMethod({
            method: 'get',
            queryParams?: ['search'],
        })
        getTable(params, queryParams): NepGetRequest<Schema> {
            return new NepGetRequest({
                select: '*',
                where: queryParams.search ? 'name LIKE ' + queryParams.search : null,
            });
        }

        @NepMethod({
            method: 'post',
        })
        addRow(params, body): NepPostRequest<Schema> {
            return new NepPostRequest({
                insert: new Schema(body.data),
            })
        }

        @NepMethod({
            method: 'get',
            params: ['id']
        })
        getRowById(params, queryParams): NepGetRequest<Schema> {
            return new NepGetRequest({
                select: '*',
                where: 'id=' + params.id,
                prep: (results: Schema[]): Schema => {
                    if (results) {
                        return results[0];
                    } else {
                        return null;
                    }
                }
            })
        }

        @NepMethod({
            method: 'delete',
            params: ['id']
        })
        deleteRowWithId(params): NepDeleteRequest<Schema> {
            return new NepDeleteRequest<Schema>({
                where: 'id=' + params.id,
            });
        }

        @NepMethod({
            method: 'put',
            params: ['id']
        })
        updateRowWithId(params, body): NepPutRequest<Schema> {
            return new NepPutRequest<Schema>({
                where: 'id=' + params.id,
                set: new Schema(body.data),
            });
        }

    }

The class decorator accepts two parameters and one optional parameter. Table is the name of the table in the database, schema is the schema
for the table (this MUST be provided though currently is not used), and the optional alias is what will be used as the base of the endpoint.
Methods in the class can be decorated using @NepMethod, which means that the method now defines an endpoint. The decorators take up to 5
parameters, with only the method type being required. You can also supply params (as in, route params), queryParams (as in, query parameters),
and a path, which will be used before any parameters but after the table/alias name. The fifth is a boolean, `custom`, which indicates that
we will generate a custom query string. The example above creates the following endpoints:

    GET     /folks?search=  // gets results from the table, optional search where 'name' is like the 'search' query param
    POST    /folks          // post data to the table, gets inserted
    GET     /folks/:id      // returns a specific person from the table by ID, or null if none found
    DELETE  /folks/:id      // deletes a person with by ID
    PUT     /folks/:id      // updates the entry for a given person

If the 'folks' alias was not provided, each of these endpoints would be using the actual table name, which in this case is `people`.

Endpoint methods decorated by `@NepMethod` return one of the `Nep[Method]Request` classes, which are detailed here:

    new NepGetRequest<T>({
        select: (keyof T)[] | '*';
        where?: string;
        orderBy?: string;
        prep?: (a: T[]) => any;
    })
    // GET request methods accept req.params and req.query as their arguments

    new NepPostRequest<T>({
        insert: T;
        prep?: (a: T) => any;
    });
    // POST request methods accept req.params and req.body as their arguments

    new NepPutRequest<T>({
        set: T;
        where: string;
        prep?: (a: T) => any;
    });
    // PUT request methods accept req.params and req.body as their arguments

    new NepDeleteRequest<T>({
        where: string;
        prep?: (a: any) => any;
    });
    // DELETE requests accept req.params only as their arguments

    new NepCustomRequest<T>({
        query: string;
        prep?: (a: any) => any;
    });
    // Custom requests can be used when you want more flexibility, or to use a currently unsupported method. The NepMethod decorator must
    // be given the 'custom' property. Custom request methods accept req.params, req.query and req.body.

## Going Forward

I would like to add support for more methods, as well as another decorator for @NepMiddleware which could be used within handler classes
to apply middleware to that table specifically. I would also like to verify endpoint method signatures, and potentially rename @NepMethod
to @NepEndpoint for clarity (though this would be backwards compatible). Any suggestions people have that would enhance the library, please
let me know by raising an issue, or an MR! I will also be packaging for npm when I get the chance.