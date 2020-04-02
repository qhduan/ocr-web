import React from 'react';
import './App.css';
import { parseData } from './parse-data'
import { Upload, Icon, Card, Checkbox, Button } from 'antd';
const { Dragger } = Upload

const api = 'http://47.245.53.119:18080/function/ocr-faas'


class Item extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      data: null,
      error: null
    }
  }

  componentDidMount() {
    this.update()
  }

  async update() {
    this.setState({loading: true, error: null, date: null})
    const {ext, base64} = this.props
    if (!ext) {
      this.setState({
        error: '错误的扩展名'
      })
      return
    }
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

  render() {
    return (
      <Card
        title={this.props.showName ? this.props.filename : null}
      > 
        {this.renderContent()}
      </Card>
    )
  }

  renderContent() {
    const {loading, data, error} = this.state

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
          <br />
          <Button onClick={() => this.update()}>重试</Button>
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
      items: [],
      showName: true,
    }
  }

  render() {
    const {items} = this.state

    const props = {
      showUploadList: false,
      name: 'file',
      multiple: true,
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
          base64 = base64.substr(base64.indexOf(',') + 1)
          this.setState({
            items: this.state.items.concat([
              <Item
                base64={base64}
                ext={ext}
                filename={file.name}
                showName={this.state.showName}
              />
            ])
          })
        }
        return false
      }
    }


    return (
      <div className="App">
        {items.map((item, ind) => (
          <div key={ind}>
            {item}
          </div>
        ))}

        <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">点击打开或拖拽一个有文字的PNG/JPG文件</p>
        </Dragger>
        <div style={{padding: '20px'}}>
          <Checkbox
            checked={this.state.showName}
            onChange={() => {
              this.setState({showName: !this.state.showName})
              for (const item of this.state.items) {
                console.log(item)
              }
            }}
          >
            是否显示文件名
          </Checkbox>
        </div>
      </div>
    )
  }
}

export default App;
