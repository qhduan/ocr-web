

function parseData(data) {
  if (data.length <= 0) {
    return ''
  }
  let wordCount = 0
  let wordLength = 0
  let leftest = data[0].x
  for (const d of data) {
    if (d.x < leftest) {
      leftest = d.x
    }
    wordCount += d.text.length
    wordLength += d.w
  }

  for (const d of data) {
    d.x -= leftest
  }

  let singleLength = wordLength / wordCount * 0.9

  let lines = []
  let line = ''
  let lastLine = null
  data.forEach(d => {
    let ret = ''
    let sameLine = false
    if (lastLine && Math.abs(lastLine.y - d.y) < singleLength) {
      sameLine = true
    }
    let leftX = d.x
    if (sameLine) {
      leftX = leftX - lastLine.x - lastLine.text.length * singleLength
    }
    const spaces = Math.round(leftX / singleLength)
    for (let i = 0; i < spaces; i++) {
      ret += ' '
    }
    ret += d.text
    if (sameLine) {
      line += ret
    } else {
      if (line.length) {
        lines.push(line)
      }
      line = ret
    }
    lastLine = d
  })
  if (line.length) {
    lines.push(line)
  }
  return lines.join('\n')
}

module.exports = {
    parseData
}