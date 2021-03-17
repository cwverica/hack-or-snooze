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
 * - isUser: True if markup is being used for logged in user
 * - myStoryList: True if markup is being used for ownStories page
 *    (will include a "trashcan" delete button)
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, isUser, myStoryList) {
  // console.debug("generateStoryMarkup", story);

  //// total overhaul of generate markup

  let markup = '';
  markup += `<li id="${story.storyId}">`

  if (myStoryList) {
    markup += `
    <span class="delete">
      <i class="fa-trash-alt fas"></i>
    </span>`
  }

  if(isUser){
    let star = "";
    if(currentUser.isUserFavorite(story.storyId)){
      star = "fas";
    } else {
      star = "far";
    }
    markup += `
    <span class="star">
    <i class="${star} fa-star"></i>
    </span>`
  }

  const hostName = story.getHostName();
  markup += 
  `
  <a href="${story.url}" target="a_blank" class="story-link">
    ${story.title}
  </a>
  <small class="story-hostname">(${hostName})</small>
  <small class="story-author">by ${story.author}</small>
  <small class="story-user">posted by ${story.username}</small>
  </li>
  `
  return $(`${markup}`);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  // console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  let isUser = false;
  if (currentUser) {isUser = true}
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story, isUser, false);
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
    const $story = generateStoryMarkup(story, true, false);
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
  // console.debug("displayMyStories")

  $myStories.empty();
  if(currentUser.ownStories.length == 0){
    $myStories.append(
      `<h5>No stories added by user yet!<h5>`
    )
    $myStories.show();
    return;
  }
  for (let story of currentUser.ownStories){
    const $story = generateStoryMarkup(story, true, true);
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

  let story = await storyList.addStory(currentUser, storyObj);
  hidePageComponents();
  getAndShowStoriesOnStart();
  putStoriesOnPage();
  return story;
}

$addStoryForm.on('submit', async function(e) {
  e.preventDefault();
  let story = await addStoryToPage(); //// was working fine before, but ... added await
  if(story){
  $('#story-author').val('');
  $('#story-title').val('');
  $('#story-url').val('');
  currentUser = await User.updateUser();
  location.reload();
  }
});

/* A function to send a delete request to the api,
 and remove the story from the UI
*/

async function deleteStory(storyId) {
  // console.log(storyId);
  try {
    storyList.deleteStoryFromList(currentUser, storyId)
    $(`#${storyId}`).remove();
  } catch (e) {
    console.log("Could not delete story", e)
  }

}
