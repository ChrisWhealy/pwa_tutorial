const firebaseVersion = '9.19.1'
const firebaseUrlPrefix = 'https://www.gstatic.com/firebasejs/'
const firebaseUrl = `${firebaseUrlPrefix}${firebaseVersion}`

const firebaseFirestore = `${firebaseUrl}/firebase-firestore.js`
const jsUi = '/js/uiEventHandlers.mjs'

export const snapshotHandler = async () => {
  const { renderRecipe, removeRecipe } = await import(jsUi)

  return snapshot => snapshot
    .docChanges()
    .forEach(changed => {
      switch (changed.type) {
        case 'added':
          renderRecipe(changed.doc.data(), changed.doc.id)
          break

        case 'removed':
          removeRecipe(changed.doc.id)
          break

        default:
          console.log(`Document change type was ${changed.type}`)
      }
    })
}

// Add recipe
export const addRecipeHandler = async db => {
  const { collection, addDoc } = await import(firebaseFirestore)

  return evt => {
    evt.preventDefault()

    addDoc(collection(db, 'recipes'), {
      title: addRecipeForm.title.value,
      ingredients: addRecipeForm.ingredients.value
    })
      .then(() => {
        addRecipeForm.title.value = ''
        addRecipeForm.ingredients.value = ''
      })
      .catch(err => console.error('ERROR: Unable to add new recipe\n', err))
  }
}

// Delete recipe
export const deleteRecipeHandler = async db => {
  const { doc, deleteDoc } = await import(firebaseFirestore)

  return evt => {
    if (evt.target.tagName === "I") {
      const id = evt.target.getAttribute("data-id")
      deleteDoc(doc(db, 'recipes', id))
        .then(() => console.log(`Recipe ${id} deleted`))
        .catch(err => console.error(`ERROR: Unable to delete document ${id}\n`, err))
    }
  }
}
