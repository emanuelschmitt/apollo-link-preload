# apollo-link-preload

This package is an Apollo Link which can pre-load GraphQL query/mutation image fields. Once a field in a query is annotated with the `@preload` directive, the image will be preloaded into the browser's cache.

Example of an annotated GraphQL query:

```
{
  album(id: 1) {
    artist
    title
    year
    cover {
      image @preload <-- preloaded image.
    } 
  }
}
```

<!-- ### Demo

|  Without @preload directive 	|   With @preload directive	|
|---	|---	|
|  ![without](./media/no-preload-low.gif "Without Preloading")	|  ![with](./media/preload-low.gif "With Preloading") 	| -->


### Why preload images?
1. _Performance_: Preloading the images will be performed in parallel giving a time advantage to page load.

2. _User Experience_: The preloaded image(s) will appear right after the data of the GraphQL request is available and the loading state of the GraphQL operation has been set to false. As a result, images will flash up immediately instead of being unavailable for a short period of time.

### Example setup (client-side)

```typescript
import ApolloLinkPreload from "apollo-link-preload";
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";

const preloadLink = ApolloLinkPreload();
const httpLink = createHttpLink();
const link = ApolloLink.from([preloadLink, httpLink]);

const apolloClient = new ApolloClient({ link });
```

⚠ Please note that this links needs to run on the client-side and (currently) cannot run during server-side-rendering.


### How it's made.
Apollo links are a concept used in Apollo GraphQL to intercept incoming and outgoing GraphQL operations from the server to the client and vice-versa.

This link will watch out for annotated fields with the `@preload` directive and use the corresponding response data to preload image uris. During preloading, a `<img>` DOM node is created in memory to fill the browser's cache with the image data.

### Further reading

- [Apollo GraphQL](https://www.apollographql.com/)
- [Apollo GraphQL Links](https://www.apollographql.com/docs/link/overview/)