"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  // console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  // console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  // console.debug("updateNavOnLogin");
  $navLogin.hide();
  $navLogOut.show();
  $loginForm.hide();
  $signupForm.hide();
  $userNavLinks.show();
  $navUserProfile.text(`${currentUser.username}`).show();
  updateProfile();
}

/** When a user logs out, update the navbar */
function updateNavOnLogout() {
  // console.debug("updateNavOnLogout");
  $navLogin.show();
  $navLogOut.hide();
  $userNavLinks.hide();

}

/** Nav-bar click handler, directing traffic for a logged-in user */
function onNavLinkClick(evt) {
  // console.debug("onNavLinkClick");
  
  if(evt.target.id=="nav-submit"){
    $addStoryForm.show();
  }
  if(evt.target.id=="nav-favorites"){
    hidePageComponents();
    compileFavorites();
  }
  if(evt.target.id=="nav-my-stories"){
    hidePageComponents();
    displayMyStories();
  }
}

$userNavLinks.on('click', onNavLinkClick);

$('#nav-user-profile').on('click', () => {
  hidePageComponents();
  $('#user-profile').show();
});