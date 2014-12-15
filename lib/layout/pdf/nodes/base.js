'use strict'

var BaseNode = module.exports = function() {
  this.type = 'BaseNode'
  this.allowBreak = false
  this.page = 0
  this.compiled = false
}

BaseNode.prototype.mustUpdate = function(/* cursor */) {
  return false
}

BaseNode.prototype.setContentHeight = function(height) {
  this.contentHeight = height
}

BaseNode.prototype.beginCompute = function(cursor) {
  return cursor
}

BaseNode.prototype.endCompute = function(cursor) {
  return cursor
}

BaseNode.prototype._compute = function(x, y, width) {
  this.x = x
  this.y = y

  this.width  = 0
  this.height = 0
}

BaseNode.prototype.compute = function(cursor) {
  var must = this.mustUpdate(cursor) || !this.compiled || cursor.force

  if (!must) {
    cursor.setPage(this.page)
  } else {
    this.compiled = true
    cursor.force = true

    this.page = cursor.currentPage
    this._compute(cursor.x, cursor.y, cursor.width)
  }

  cursor = this.beginCompute(cursor)

  if ('children' in this) {
    var height = 0

    for (var i = 0; i < this.children.length; ++i) {
      var child = this.children[i]

      if (child.type === 'PageBreakNode') {
        // console.log('PageBreakNode', must, this.compiled, cursor.force)

        if (cursor.pageBreak(child) === null) {
          console.log('INVALIDATE', child.id)
          this.children.splice(i, 1)
          --i
        } else {
          console.log('VALID')
        }

        continue
      }

      if (!child.compute(cursor)) {
        return false
      }

      height += child.height

      if (cursor.mustBreak(child)) {
        console.log('BREAK', child.type, child.y, child.height)
        child.compiled = false

        // page break
        this.children.splice(i, 0, cursor.pageBreak())

        return false
      }
    }

    this.setContentHeight(height)
  }

  this.endCompute(cursor)

  return true
}