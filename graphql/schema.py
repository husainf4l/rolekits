import strawberry
from graphql.resolvers import Query, Mutation
from strawberry.fastapi import GraphQLRouter

schema = strawberry.Schema(query=Query, mutation=Mutation)

def get_context(request):
    """Extract token from request headers"""
    auth_header = request.headers.get("Authorization", "")
    token = None
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    return {"token": token}

graphql_app = GraphQLRouter(schema, context_getter=get_context)
