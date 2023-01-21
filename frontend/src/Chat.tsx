import React from 'react';

class Chat extends React.Component {
	// constructor(props) {
	//   super(props);
	//   this.state = {value: ''};
	//   this.handleChange = this.handleChange.bind(this);
	//   this.handleSubmit = this.handleSubmit.bind(this);
	// }
  
	handleChange()
	{
		console.log("hand change");
		// this.setState({value: event.target.value});
	}
	handleSubmit() {
		console.log("aaaa");
	//   alert('A name was submitted: ' + this.state.value);
	//   event.preventDefault();
	}
  
	render(): React.ReactNode {
	  return(
		<form onSubmit={this.handleSubmit}>
		  <label>
			Message:
		  <input value="aaa" onChange={this.handleChange} type="text"/>
		  </label>
		  <input type="submit" value="Submit" />
		</form>
		);
	}
  }

  export default Chat