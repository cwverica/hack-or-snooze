"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  let star = "";
  if(isUserFavorite(story.storyId)){
    star = "fas";
  } else {
    star = "far";
  }

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <span class="star">
        <i class="${star} fa-star"></i>
      </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  // console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.on('click', (evt) => {
    if([...evt.target.classList].includes("fa-star")){
      toggleFavoriteStatus(evt.target.parentElement.parentElement.id);
      evt.target.classList.toggle("far");
      evt.target.classList.toggle("fas");
    }
  })

  $allStoriesList.show();
}

function compileFavorites() {
  // console.debug("compileFavorites");

  $favoriteStories.empty();
  if(currentUser.favorites.length == 0){
    $favoriteStories.append(
      `<h5>No stories favorited by user yet!</h5>`
    )
    $favoriteStories.show();
    return;
  }
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStories.append($story);
  }
  $favoriteStories.on('click', (evt) => {
    if([...evt.target.classList].includes("fa-star")){
      toggleFavoriteStatus(evt.target.parentElement.parentElement.id);
      evt.target.classList.toggle("far");
      evt.target.classList.toggle("fas");
    }
  })

  $favoriteStories.show();
}

function displayMyStories() {
  console.debug("displayMyStories")

  $myStories.empty();
  if(currentUser.ownStories.length == 0){
    $myStories.append(
      `<h5>No stories added by user yet!<h5>`
    )
    $myStories.show();
    return;
  }
  for (let story of currentUser.ownStories){
    const $story = generateStoryMarkup(story);
    $story.prepend(`
    <span class="delete">
      <i class="fa-trash-alt fas"></i>
      </span>`);
    $myStories.append($story);
  }
  $myStories.on('click', (evt) => {
    if([...evt.target.classList].includes("fa-star")){
      toggleFavoriteStatus(evt.target.parentElement.parentElement.id);
      evt.target.classList.toggle("far");
      evt.target.classList.toggle("fas");
    } else if ([...evt.target.classList].includes("fa-trash-alt")){
      deleteStory(evt.target.parentElement.parentElement.id);
    }
  });

  $myStories.show();
}

/* A method to toggle the favorite visual */
function toggleStarred(target){
  target.className = (target.className == "fa-star fas" ? "fa-star far" : "fa-star fas");
}

/** Pulls the values from the new story form, creates a story,
 *  submits it to the api, then loads it to the page.
 */
async function addStoryToPage(){
  const author = $('#story-author').val();
  const title = $('#story-title').val();
  const url = $('#story-url').val();
  const storyObj = {title, author, url};
  console.log(storyObj);

  const story = await storyList.addStory(currentUser, storyObj);
  hidePageComponents();
  getAndShowStoriesOnStart();
  putStoriesOnPage();
  return story;
}

$addStoryForm.on('submit', async function(e) {
  e.preventDefault();
  const story = addStoryToPage();
  if(story){
  $('#story-author').val('');
  $('#story-title').val('');
  $('#story-url').val('');
  currentUser = await User.updateUser();
  location.reload();
  }
});

/* Checks to see if current story is favorited */ 
function isUserFavorite(storyId){
  return currentUser && currentUser.favorites.some(story => (story.storyId == storyId));
}
 /* Finds the story's index in the users favorite list */
function findFavoriteIndex(storyId) {
  for (let x=0; x < currentUser.favorites.length; x++){
    if(currentUser.favorites[x].storyId == storyId){
      return x;
    }
  }
  return -1;
}
/* A function to send a delete request to the api,
 and remove the story from the UI
*/

async function deleteStory(storyId) {
  console.log(storyId);
  $(`#${storyId}`).remove();
  try{
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: {
        "token": currentUser.loginToken
      }
    });
    currentUser = await User.updateUser();
    displayMyStories();
  }
  catch (e){
    console.error("Failed to delete story", e)
  }

}
