
var t = _.template('<p><input type="checkbox" id=<%=k %> <%=checked %> value="<%=k%>" ><%=k %></p>')


$(function(){
	var x = $("#menueditor");
	self.port.on("config",function(data){
		let keys = Object.keys(data.config)
		keys.sort()
		keys.forEach(function(k){
			x.append(t({k:k,checked: ["","checked=''"][~~data.config[k]]}));
		})

		$('input[type="checkbox"]').change(function () {
	      var name = $(this).val();
	      var check = $(this).is(':checked');
	      data.config[name] = check;
	      console.log(JSON.stringify(data.config[name]))
	      self.port.emit("updated",data.config);
	      console.log("Change: " + name + " to " + check);
	  });
	})
})