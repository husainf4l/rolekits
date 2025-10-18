import strawberry
from gql.resolvers import Query, Mutation, Subscription
from strawberry.fastapi import GraphQLRouter
from fastapi import Request, Response

schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)

async def get_context(request: Request, response: Response):
    """Extract token from request headers"""
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    return {"token": token, "request": request, "response": response}

graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context,
    graphiql=True  # Enable GraphiQL interface
)
