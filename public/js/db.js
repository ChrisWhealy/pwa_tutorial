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
