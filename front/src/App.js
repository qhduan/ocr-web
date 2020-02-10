import React from 'react';
import './App.css';

import { Upload, Icon, Card } from 'antd';
const { Dragger } = Upload

const api = 'http://23.98.32.50/ocr/api/ocr/base64'


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

  let singleLength = wordLength / wordCount + 0.1

  let ret = ''
  for (const d of data) {
    const spaces = Math.round(d.x / singleLength)
    for (let i = 0; i < spaces; i++) {
      ret += ' '
    }
    ret += d.text
    ret += '\n'
  }
  return ret

}


class Item extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      data: null,
      error: null
    }
  }

  render() {
    return (
      <Card>
        {this.renderContent()}
      </Card>
    )
  }

  renderContent() {
    const {loading, data, error} = this.state

    const props = {
      name: 'file',
      multiple: false,
      beforeUpload: file => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {

          if (this.props.onLoad) {
            this.props.onLoad()
          }

          let base64 = reader.result
          let ext = null
          if (base64.indexOf('png') >= 0) {
            ext = '.png'
          } else if (base64.indexOf('jpg') >= 0 || base64.indexOf('jpeg') >= 0) {
            ext = '.jpg'
          }
          if (!ext) {
            this.setState({
              error: '错误的扩展名'
            })
            return
          }
          base64 = base64.substr(base64.indexOf(',') + 1)
          this.setState({loading: true})
          const res = await fetch(api, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              image: base64,
              'ext': ext
            })
          })
          const json = await res.json()
          this.setState({loading: false})
          if (!json.ok || !json.hasOwnProperty('data')) {
            this.setState({
              error: json.error || '未知错误'
            })
          } else if (json.hasOwnProperty('data') && json.data.length <= 0) {
            this.setState({
              error: '未识别到数据'
            })
          } else {
            this.setState({data: json.data})
          }
        }
        return false
      }
    }

    if (!loading && !data && !error) {
      return (
        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">点击打开或拖拽一个有文字的PNG/JPG文件</p>
        </Dragger>
      )
    }
    if (loading) {
      return (
        <div>
          载入中
        </div>
      )
    }
    if (error) {
      return (
        <div>
          {error}
        </div>
      )
    }
    if (data) {
      return (
        <div>
          <pre>{parseData(data)}</pre>
        </div>
      )
    }
  }
}



class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: []
    }
  }

  addItem = () => {
    const {items} = this.state
    items.push(<Item onLoad={this.addItem} />)
    this.setState(items)
  }

  componentDidMount() {
    this.addItem()
  }

  render() {
    const {items} = this.state
    return (
      <div className="App">
        {items.map((item, ind) => (
          <div key={ind}>
            {item}
          </div>
        ))}
      </div>
    )
  }
}

export default App;
