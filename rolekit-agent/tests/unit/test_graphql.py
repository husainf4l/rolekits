"""
Test script to check the GraphQL schema and introspection
"""
import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv()

async def introspect_schema():
    """Get the GraphQL schema via introspection"""
    
    introspection_query = """
    query IntrospectionQuery {
        __schema {
            mutationType {
                name
                fields {
                    name
                    description
                    args {
                        name
                        type {
                            name
                            kind
                            ofType {
                                name
                                kind
                            }
                        }
                    }
                }
            }
            types {
                name
                kind
                fields {
                    name
                    type {
                        name
                        kind
                        ofType {
                            name
                            kind
                        }
                    }
                }
                inputFields {
                    name
                    type {
                        name
                        kind
                        ofType {
                            name
                            kind
                        }
                    }
                }
            }
        }
    }
    """
    
    backend_url = os.getenv("BACKEND_URL", "http://localhost:4003/graphql")
    bearer_token = "rk_c97cf8f6ea0a8d2ba0a09a8bf45b0f6e1dcd9a0b76be633d185aa3d5a2ee5061"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {bearer_token}",
        "x-api-key": bearer_token
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                backend_url,
                json={"query": introspection_query},
                headers=headers,
                timeout=30.0
            )
            
            print(f"Status Code: {response.status_code}")
            result = response.json()
            
            # Find the updateCV mutation
            if "data" in result and "__schema" in result["data"]:
                mutation_type = result["data"]["__schema"].get("mutationType")
                if mutation_type:
                    print("\n=== MUTATIONS ===")
                    for field in mutation_type.get("fields", []):
                        if "cv" in field["name"].lower() or "CV" in field["name"]:
                            print(f"\nMutation: {field['name']}")
                            print(f"Description: {field.get('description', 'N/A')}")
                            print("Arguments:")
                            for arg in field.get("args", []):
                                print(f"  - {arg['name']}: {arg['type']}")
                
                # Find input types related to CV
                print("\n=== INPUT TYPES ===")
                for type_info in result["data"]["__schema"].get("types", []):
                    if type_info["kind"] == "INPUT_OBJECT" and "CV" in type_info["name"]:
                        print(f"\nInput Type: {type_info['name']}")
                        for field in type_info.get("inputFields", []):
                            print(f"  - {field['name']}: {field['type']}")
            
            # Save full schema for inspection
            with open("graphql_schema.json", "w") as f:
                json.dump(result, f, indent=2)
            print("\n\nFull schema saved to graphql_schema.json")
            
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(introspect_schema())
