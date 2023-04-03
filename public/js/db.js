import {
  collection,
  doc,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.19.0/firebase-firestore.js"
import { renderRecipe, removeRecipe } from "/js/ui.js"

export const snapshotHandler = snapshot =>
  snapshot.docChanges().forEach(changed => {
    switch (changed.type) {
      case 'added':
        renderRecipe(changed.doc.data(), changed.doc.id)
        break

      case 'removed':
        removeRecipe(changed.doc.id)
        break

      default: console.log(`Document change type was ${changed.type}`)
    }
  })

// Add recipe
export const addRecipeHandler = db => evt => {
  evt.preventDefault()

  addDoc(collection(db, 'recipes'), {
    title: addRecipeForm.title.value,
    ingredients: addRecipeForm.ingredients.value
  })
    .then(() => {
      addRecipeForm.title.value = ''
      addRecipeForm.ingredients.value = ''
    })
    .catch(err => console.error('ERROR: Unable to add new recipe/n', err))
}

// Delete recipe
export const deleteRecipeHandler = db => evt => {
  if (evt.target.tagName === "I") {
    const id = evt.target.getAttribute("data-id")
    deleteDoc(doc(db, 'recipes', id))
      .then(() => console.log(`Recipe ${id} deleted`))
      .catch(err => console.error(`ERROR: Unable to delete document ${id}`))
  }
}
