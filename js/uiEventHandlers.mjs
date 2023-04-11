// Render recipe
export const renderRecipe = (recipe, recipeId) => {
  const html = `
    <div class="card-panel recipe white row" data-id="${recipeId}">
      <img src="/img/dish.png" alt="recipe thumb">
      <div class="recipe-details">
        <div class="recipe-title">${recipe.title}</div>
        <div class="recipe-ingredients">${recipe.ingredients}</div>
      </div>
      <div class="recipe-delete">
        <i class="material-icons" data-id="${recipeId}">delete_outline</i>
      </div>
    </div>
    `

  document.querySelector('.recipes').innerHTML += html
}

// Remove deleted recipe
export const removeRecipe = recipeId => {
  const recipe = document.querySelector(`.recipe[data-id=${recipeId}]`)
  recipe.remove()
}
