function parseUser(responseJson){
  return responseJson.graphql.user;
}

function parseUsername(responseJson){
  return parseUser(responseJson).username;
}

function parseFollowers(responseJson){
  return parseUser(responseJson).edge_followed_by.count;
}

function parseFollowing(responseJson){
  return parseUser(responseJson).edge_follow.count;
}
