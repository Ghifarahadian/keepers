interface Position {
  x: number
  y: number
  width: number
  height: number
}

export function calculateResizedPosition(
  direction: string,
  mouseX: number,
  mouseY: number,
  startPosition: Position
): Position {
  let newX = startPosition.x
  let newY = startPosition.y
  let newWidth = startPosition.width
  let newHeight = startPosition.height

  // Handle horizontal resizing
  if (direction.includes("e")) {
    newWidth = Math.max(5, Math.min(100 - startPosition.x, mouseX - startPosition.x))
  }
  if (direction.includes("w")) {
    // Prevent zone from inverting - left edge can't go past original right edge
    const maxX = startPosition.x + startPosition.width - 5
    newX = Math.max(0, Math.min(maxX, mouseX))
    newWidth = startPosition.x + startPosition.width - newX
  }

  // Handle vertical resizing
  if (direction.includes("s")) {
    newHeight = Math.max(5, Math.min(100 - startPosition.y, mouseY - startPosition.y))
  }
  if (direction.includes("n")) {
    // Prevent zone from inverting - top edge can't go past original bottom edge
    const maxY = startPosition.y + startPosition.height - 5
    newY = Math.max(0, Math.min(maxY, mouseY))
    newHeight = startPosition.y + startPosition.height - newY
  }

  return { x: newX, y: newY, width: newWidth, height: newHeight }
}
