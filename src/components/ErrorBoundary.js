import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state = { hasError:false, err:null }; }
  static getDerivedStateFromError(err){ return { hasError:true, err }; }
  componentDidCatch(err, info){ console.error("UI CRASH:", err, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{padding:24,fontFamily:'sans-serif'}}>
          <h2>Đã xảy ra lỗi khi hiển thị</h2>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.err)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
