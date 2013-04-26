var db;
//var server="http://88.26.234.189:8085";
var server="http://192.168.254.109";
var isMobile=false;
var deviceId=1;
//var deviceId= device.uuid;
var ItemId=0;					//Permite conocer el id del gasto (Tabla: Expense) seleccionad0
var idNotaGastos=0;				//Permite conocer el id de la Nota de Gastos (Tabla: Expense_Group) seleccionada
var accion="";					//Permite saber la acción (INSERT, UPDATE, DELETE, TRAMITAR) seleccionada
//var tipoGasto="";				//Permite saber el tipo de gasto: Trayecto, comida u otros
var isDirty=0;					//Permite saber si ha habido cambios en algún campo del formulario principal
var addExpenses=false;			//Variable que indica que los gastos se añadirán a una nota de gatos. La utilizamos para aprovechar la función "obtenerItems"
//VALORES CAMPO "idDevice" DE LA NG
var idDeviceStatus = {"NO_CHANGES" : 0,				//Sin cambios
					  "NEW_ON_DEVICE" : 1,			//NG nueva
		  			  "CHANGED_ON_DEVICE" : 2,		//Han habido modificaciones
					  "NEW_AND_CHANGED_ON_DEVICE":4, //Han habido modificaciones
					  "DELETED_ON_DEVICE" : 3,		//Marcado como borrado
					  "SENT_TO_VALIDATE" : 6,		//Enviado a tramitar (o validar)
					  "NEW_AND_DELETED_ON_DEVICE" :5 
					 }; 
Date.prototype.customFormat = function(formatString){
				var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
				var dateObject = this;
				YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
				MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
				MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
				DD = (D=dateObject.getDate())<10?('0'+D):D;
				DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
				th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
				formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

				h=(hhh=dateObject.getHours());
				if (h==0) h=24;
				if (h>12) h-=12;
				hh = h<10?('0'+h):h;
				AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
				mm=(m=dateObject.getMinutes())<10?('0'+m):m;
				ss=(s=dateObject.getSeconds())<10?('0'+s):s;
				return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
			}

function visualiza (tipoGasto)
{	

		switch (tipoGasto)
		{
		case "1":		//Trayecto
			    $("#txtKm_ico").show();$("#txtKm").show();
				$("#txtImporteKm_ico").show();$("#txtImporteKm").show();
				$('#txtImporte').attr('readonly', true);
				//Si existe el importe por kilómetro asignado al usuario,
				//Ponemos el valor en el campo y lo bloqueamos
				if (typeof window.localStorage["ImporteKm"] !=="undefined")
					if (window.localStorage["ImporteKm"]!="")
					{
					    $('#ImporteKm').val(window.localStorage["ImporteKm"]);
						$('#ImporteKm').attr('readonly', true);
					}
				//Cargamos los combos en función del tipo de gasto
				ExpenseTypeList(1);
				break;
		case "2":		//Invitación
				//$("#txtDescription_ico").show();$("#txtDescription").show();
				$("#txtKm_ico").hide();$("#txtKm").hide();
				$("#txtImporteKm_ico").hide();$("#txtImporteKm").hide();
				$('#txtImporte').attr('readonly', false);
				$('#ImporteKm').attr('readonly', false);
				//Cargamos los combos en función del tipo de gasto
				ExpenseTypeList(2);
				break;
		case "3":		//Gasto
				//$("#txtDescription_ico").show();$("#txtDescription").show();
				$("#txtKm_ico").hide();$("#txtKm").hide();
				$("#txtImporteKm_ico").hide();$("#txtImporteKm").hide();
				$('#txtImporte').attr('readonly', false);
				$('#ImporteKm').attr('readonly', false);
				//Cargamos los combos en función del tipo de gasto
				ExpenseTypeList(3);
				break;
		}
}
function CreaTablas(tx) {
     try	{
  	     tx.executeSql('DROP table IF EXISTS Expense');
    	 tx.executeSql('CREATE TABLE IF NOT EXISTS Expense(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, Expense_NG_Id INTEGER, idExpense_Server INTEGER, DeviceId TEXT, OwnerId INTEGER, CompanyId INTEGER, TipoGasto INTEGER, ExpenseDate DATE, DateCreation DATETIME,  LastModifiedDate DATETIME ,  Amount DOUBLE, Currency TEXT, Description TEXT, km DOUBLE, ImporteKm DOUBLE, Image TEXT,IdDeviceStatus INTEGER)');
		 tx.executeSql('DROP table IF EXISTS Expense_Group');
    	 tx.executeSql('CREATE TABLE IF NOT EXISTS Expense_Group(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, DeviceId TEXT, OwnerId INTEGER, CompanyId INTEGER, Name TEXT, Description TEXT, ExpenseGroupDate DATE, DateCreation DATETIME , LastModifiedDate DATETIME , Status INTEGER, idProject INTEGER, idDepartment INTEGER, IdDeviceStatus INTEGER)');
         }
     catch (err)
     {
         alert("err: " + err);
     }
}

function resetFields()
{
	//limpiamos campos del formulario de NGs

	$('#txtFecha').val('');
	$('#txtDescription').val('')
	$('#txtKm').val('')
	$('#txtImporteKm').val('')
	$('#txtImporte').val('')
	$('#cmbCurrency').find('option:first').attr('selected', 'selected');
//	$('#cmbCurrency').selectmenu('refresh',true);
	$('#cmbExpenseType').find('option:first').attr('selected', 'selected');
	//$('#cmbExpenseType').selectmenu('refresh',true);
	$('#txtImage').val('')
}
function errorCB(err) {
    alert("Error processing SQL: Codigo: " + err.code + " Mensaje: "+err.message);
	return false;
}

function successCB() {
	if (accion!="")
	{
		switch (accion)
		{
			case "INSERT":
				alert("Registro creado correctamente.");
				break;
			case "UPDATE":
				alert("Registro actualizado correctamente.");
				break;
			case "DELETE":
				alert("Registro eliminado correctamente.");
					break;
			case "TRAMITAR":
				break;
				alert("Nota de Gastos enviada a tramitar.");

		}
		//Vamos al menú principal
		 accion="";
	}
}

function CreaDB() {
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	db.transaction(CreaTablas, errorCB, successCB);
}

function Agregar(n) {
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	switch(n)
	{
	case 1:		//Agregar un gasto
		db.transaction(AgregaItem, errorCB, successCB);
		break;
	case 2:		//Agregar una nota de gastos
		db.transaction(AgregaNotaGastos, errorCB, successCB);
		break;

	default:
  		
	}
}
function enTramite(tx)
{
	try {
		if (ItemId>0)
		{
			accion="TRAMITAR";
			tx.executeSql('UPDATE Expense SET Status=1, IdDeviceStatus=' + idDeviceStatus.SENT_TO_VALIDATE + ' WHERE id='+ItemId); //Status=1 "enviada a trámitar"
		}
	}
	catch (err) {
		alert("err: " + err);
	}
}
function Tramitar()
{
	Agregar(1);			//Guardamos
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	db.transaction(enTramite, errorCB, successCB);
}

function marcarBorradoItem(tx) {
	try {
		if (ItemId>0)
		{
			accion="DELETE";
			//TODO: ESTADO DEL ELIMINADO ...
			tx.executeSql('UPDATE Expense SET IdDeviceStatus=' + idDeviceStatus.DELETED_ON_DEVICE + ' WHERE id='+ItemId); 
		}
	}
	catch (err) {
		alert("err: " + err);
	}
}
function BorrarItem() {
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	db.transaction(marcarBorradoItem, errorCB, successCB);
	
}

function marcarBorradoNotaGastos(tx) {

	try {

		if (idNotaGastos>0)
		{
			accion="DELETE";
			//TODO: ESTADO DEL ELIMINADO ...
			tx.executeSql('UPDATE Expense_Group SET IdDeviceStatus=' + idDeviceStatus.DELETED_ON_DEVICE + ' WHERE id='+idNotaGastos); 
			//Desvinculamos los posibles gastos que tuviera asociados
			tx.executeSql('UPDATE Expense SET Expense_NG_Id=0 WHERE Expense_NG_Id=' + idNotaGastos);
		}
	}
	catch (err) {
		alert("err: " + err);
	}
}
function BorrarNotaGastos() {

	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	db.transaction(marcarBorradoNotaGastos, errorCB, successCB);
	
}

function sincronizaGasto(idStatus,nowServer)
{
	//data: { accesscode: accesscodevalue, questionid: questionid },
	alert("idStatus: " + idStatus);
	 var expensesData = new Object();
	 expensesData.InternalId=ItemId;
	 expensesData.action="EXPENSE_NEW";
	 expensesData.ExpenseId=$('#txtIdExpenseServer').val();			//id del gastos en el servidor (si va bien la sincronización el servidor devolverá el id que le toca)
	 expensesData.ExpenseStatus=idStatus;
	 expensesData.ExpenseTypeValue =$('#cmbExpenseType').val();
	 expensesData.ExpenseAmount  =$('#txtImporte').val();
	 expensesData.ExpenseCurrency =$('#cmbCurrency').val();
	 expensesData.ExpenseDate=$('#txtFecha').val();
	 expensesData.ExpenseCreateDate =nowServer;
	 expensesData.ExpenseLastActionDate=nowServer;
	 expensesData.ExpenseDistance =$('#txtKm').val();
	 expensesData.ExpensePriceKM=$('#txtImporteKm').val();
	 expensesData.ExpenseLocalId=ItemId;
	 expensesData.ExpenseDeviceId =deviceId;
	 expensesData.ExpenseDescription=$('#txtDescription').val();
	 //multi-part de la imagen
	 expensesData.ExpenseTicket=$('#txtImage').val();
	 expensesData.ExpenseOwnerId=window.localStorage["userId"];     
	 expensesData.ExpenseUserId =window.localStorage["userId"]; 
	 $.ajax(
	  {
		url: server + "/Expense/ExpenseActions.php",

		data: expensesData,
		type: 'POST',
		error : function (data){
			$('#Title').html('Error de acceso:' + data.responseText); 
		}, 
		success: function (data) {
			var res;
			eval ('res = ' + data + ';');
			if(res.success)
			{
				db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
				db.transaction(function (tx) {
						var query='UPDATE Expense SET idExpense_Server=' + res.ExpenseId +',IdDeviceStatus=0 WHERE id=' +ItemId;
						tx.executeSql(query, [], 
									   function () {}
						, function error() {
								alert ("SYNC: Se ha producido al cambiar el el estado del gasto.");
						   }
					   );
				   });
				/*alert('ok');
				alert("NGId:" + res.ExpenseId);
				alert("NGStatus:" + res.DeviceId);
				alert("localID:" + res.LocalId);*/
			}
			else
			{
				  navigator.notification.alert("Error en la sincronizaci&oacute;n.", function() {});
			}
		}
	});
}


//****************************************************
//Guardar un gasto
//****************************************************
function AgregaItem(tx) {
	var lastModifiedDate = new Date;
	var now=lastModifiedDate.customFormat("#MM#-#DD#-#YYYY# #hh#:#mm#:#ss#");
	var nowServer=lastModifiedDate.customFormat("#YYYY#-#MM#-#DD#-#hh#:#mm#:#ss#");
	var oldIdDeviceStatus=-1;
	var newIdDeviceStatus=-1;
	if ($('#txtIdDeviceStatus').val()=="")
	{
		oldIdDeviceStatus=-1;
	}
	else
	{
		oldIdDeviceStatus=$('#txtIdDeviceStatus').val()*1;
	}

	try {
		switch (oldIdDeviceStatus)
			{
				case idDeviceStatus.NO_CHANGES: newIdDeviceStatus=idDeviceStatus.CHANGED_ON_DEVICE; break;
				case idDeviceStatus.NEW_ON_DEVICE: newIdDeviceStatus=idDeviceStatus.NEW_AND_CHANGED_ON_DEVICE; break;
				case idDeviceStatus.CHANGED_ON_DEVICE: newIdDeviceStatus=idDeviceStatus.CHANGED_ON_DEVICE; break;
				case idDeviceStatus.NEW_AND_CHANGED_ON_DEVICE: newIdDeviceStatus=idDeviceStatus.NEW_AND_CHANGED_ON_DEVICE; break;
				default:
					newIdDeviceStatus=idDeviceStatus.NEW_ON_DEVICE;
			}
		if (ItemId>0)
		{
			var lastModifiedDate = new Date;
			var now=lastModifiedDate.customFormat("#MM#-#DD#-#YYYY# #hh#:#mm#:#ss#");
			var query='UPDATE Expense SET IdDeviceStatus=' +newIdDeviceStatus +', TipoGasto=' + $('#cmbExpenseType').val() + ',Amount=' + $('#txtImporte').val() + ',Currency="'+$('#cmbCurrency').val() + '", ExpenseDate="' + $('#txtFecha').val()+ '",LastModifiedDate="' + now + '",Description="'+$('#txtDescription').val()+'",km="'+$('#txtKm').val()+'", ImporteKm="'+$('#txtImporteKm').val() +'", Image="'+$('#txtImage').val()+'" WHERE id='+ItemId;
			accion="UPDATE";
			tx.executeSql(query);
		}
		else
		{
			accion="INSERT";
			//idDeviceStatus.NEW_ON_DEVICE=1 
			//id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, Expense_NG_Id INTEGER, DeviceId TEXT, OwnerId INTEGER, CompanyId INTEGER, TipoGasto INTEGER, ExpenseDate DATE, DateCreation DATE, LastModifiedDate DATE, Status INTEGER, Amount DOUBLE, Currency TEXT, Description TEXT, km DOUBLE, ImporteKm DOUBLE, Image TEXT,IdDeviceStatus INTEGER)');
			 tx.executeSql('INSERT INTO Expense (Expense_NG_Id, idExpense_Server, DeviceId, OwnerId,CompanyID, TipoGasto, ExpenseDate,DateCreation, LastModifiedDate, Amount, Currency, Description, km, ImporteKm, Image,IdDeviceStatus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
						   [0,-1,$('#txtIdDeviceStatus').val(),window.localStorage["userId"] ,1,$('#cmbExpenseType').val(),$('#txtFecha').val(), now,now,$('#txtImporte').val(),$('#cmbCurrency').val(),$('#txtDescription').val(),$('#txtKm').val(),$('#txtImporteKm').val(),$('#txtImage').val(),idDeviceStatus.NEW_ON_DEVICE],
							 function(tx, results){
								ItemId=results.insertId;
							}
			 );
		} 
	}
	catch (err) {
		alert("err: " + err);
	}
	//Si existe conexión enviamos los datos guardados al servidor central
	if 	(isOnLine())
	{
		if ((oldIdDeviceStatus==-1) && (newIdDeviceStatus==idDeviceStatus.NEW_ON_DEVICE))
		{
			sincronizaGasto(idDeviceStatus.NEW_ON_DEVICE,nowServer);
		}
		if ((oldIdDeviceStatus==idDeviceStatus.NEW_ON_DEVICE) && (newIdDeviceStatus==idDeviceStatus.NEW_AND_CHANGED_ON_DEVICE))
		{
			sincronizaGasto(idDeviceStatus.NEW_ON_DEVICE,nowServer);
		}
		if ((oldIdDeviceStatus==idDeviceStatus.NEW_AND_CHANGED_ON_DEVICE) && (newIdDeviceStatus==idDeviceStatus.NEW_AND_CHANGED_ON_DEVICE))
		{
			sincronizaGasto(idDeviceStatus.NEW_ON_DEVICE,nowServer);
		}
		if ((oldIdDeviceStatus==idDeviceStatus.NO_CHANGES) && (newIdDeviceStatus==idDeviceStatus.CHANGED_ON_DEVICE))
		{
			sincronizaGasto(idDeviceStatus.CHANGED_ON_DEVICE,nowServer);
		}
		if ((oldIdDeviceStatus==idDeviceStatus.CHANGED_ON_DEVICE) && (newIdDeviceStatus==idDeviceStatus.CHANGED_ON_DEVICE))
		{
			sincronizaGasto(idDeviceStatus.CHANGED_ON_DEVICE,nowServer);
		}


	}
	else
	{
		//		alert("No hay conexión!");
	}
}

//*********************************************
//Guarda una NOTA DE GASTOS
//*********************************************

function AgregaNotaGastos(tx) {

	try {
		if (ItemId>0)
		{
			var lastModifiedDate = new Date;
			var now=lastModifiedDate.customFormat("#MM#-#DD#-#YYYY# #hh#:#mm#:#ss#");
			var query='UPDATE Expense_Group SET Name="' + $('#txtName_Group').val() + '", ExpenseGroupDate="' + $('#txtFecha_Group').val()+ '",Description="'+$('#txtDescription_Group').val()+'",LastModifiedDate="' + now + '",idProject=' + $('#cmbProject').val() + ',idDepartment=' +$('#cmbDepartment').val() + ' WHERE id='+ItemId;
			accion="UPDATE";
			tx.executeSql(query);
		}
		else
		{
			var lastModifiedDate = new Date;
			var now=lastModifiedDate.customFormat("#MM#-#DD#-#YYYY# #hh#:#mm#:#ss#");
			accion="INSERT";
			 tx.executeSql('INSERT INTO Expense_Group (DeviceId, OwnerId,CompanyID, Name, Description, ExpenseGroupDate,DateCreation, LastModifiedDate,Status, idProject, idDepartment,IdDeviceStatus) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
						   [deviceId,window.localStorage["userId"] ,1,$('#txtName_Group').val(),$('#txtDescription_Group').val(),$('#txtFecha_Group').val(), now,now, "0",$('#cmbProject').val(),$('#cmbDepartment').val(),idDeviceStatus.NEW_ON_DEVICE],
							 function(tx, results){
								ItemId=results.insertId;
							}
			 );
		} 
	}
	catch (err) {
		alert("err: " + err);
	}
}



function Mostrar(n) {
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	switch(n)
	{
		case 1:			//Lista los gastos clasificados según su estado (borrador, aprobados ...)
			db.transaction(ObtenerItems, errorCB);
		  break;
		case 2:			//Obtiene la información del gasto seleccionado
			db.transaction(ObtenerItem, errorCB);
			break;
		case 3:			//Lista las notas de gastos clasificadas según su estado (borrador, aprobados ...)
			db.transaction(ObtenerNotasGastos, errorCB);
			break;
		case 4:			//Obtiene la información de la nota de gastos seleccionada
			db.transaction(ObtenerNotaGasto, errorCB);

		  break;
		case 5:			//Muestra los gastos susceptibles de ser seleccionados para añadirlos a una Nota de Gastos
			addExpenses=true;		//Variable que indica que los gastos se añadirán a una nota de gatos. La utilizamos para aprovechar la función "obtenerItems"
			db.transaction(ObtenerItems, errorCB);
		  break;
		default:
	}
}

function ObtenerGastosAsignados()
{
}

function ObtenerItems(tx) {
	var query="";
	//Si la lista de gastos es para seleccionarlos y añadirlos a una Nota de Gastos, solo mostrartemos los de estado borrador (=0)
	if (addExpenses)
	{	
   	    query='SELECT Expense.id, ExpenseType.ItemGroupId as TipoGasto, ExpenseType.ItemGroupDescription as ExpenseType,Km,ImporteKm,Currency,Amount,Description,ExpenseDate, Image FROM Expense INNER JOIN ExpenseType ON Expense.TipoGasto = ExpenseType.ItemId WHERE IdDeviceStatus<>' + idDeviceStatus.DELETED_ON_DEVICE + ' AND status=0 AND Expense_NG_Id=0 ORDER BY ExpenseDate';
	}
	else
	{
		query='SELECT Expense.id, ExpenseType.ItemGroupId as TipoGasto, ExpenseType.ItemGroupDescription as ExpenseType,Km,ImporteKm,Currency,Amount,Description,ExpenseDate, Image FROM Expense INNER JOIN ExpenseType ON Expense.TipoGasto = ExpenseType.ItemId WHERE IdDeviceStatus<>' + idDeviceStatus.DELETED_ON_DEVICE + ' ORDER BY ExpenseDate desc';
	}
    tx.executeSql(query , [], MuestraItems, errorCB);
}
function ObtenerItem(tx) {
	if (typeof ItemId !== "undefined"){
	   var query='SELECT Expense.*,ExpenseType.ItemGroupId FROM Expense INNER JOIN ExpenseType ON Expense.TipoGasto = ExpenseType.ItemId WHERE Expense.id=' +ItemId;
       tx.executeSql(query, [], MuestraItem, errorCB);
	}
}

function ObtenerNotasGastos(tx) {
	var query='SELECT Expense_Group.*,Department.Description, Project.Name as Project, Department.Description as Department FROM Expense_Group INNER JOIN Department ON Expense_Group.idDepartment= Department.Id INNER JOIN Project ON Expense_Group.idProject=Project.Id WHERE IdDeviceStatus<>' + idDeviceStatus.DELETED_ON_DEVICE + ' ORDER BY Status, DateCreation';
    tx.executeSql(query , [], MuestraNotasGastos, errorCB);
}

function ObtenerNotaGasto(tx) {
	if (typeof idNotaGastos !== "undefined"){
	   var query='SELECT * FROM Expense_Group WHERE id=' +idNotaGastos;

       tx.executeSql(query, [], MuestraNotaGasto, errorCB);

	}
}

function MuestraNotaGasto(tx, results) {

     var len = results.rows.length;
	 $("#ListaGastoAnexado").empty();
     if (len > 0) {
		 if (results.rows.item(0).Status!=0)	//Si no está en borrador, ocultaremos los botones de guardar, tramitar, borrar y captura
		 {
			$('#save').hide();
			$('#delete').hide();
			$('#validate').hide();
		 }
		 else
		 {
		 	$('#save').show();
			$('#delete').show();
			$('#validate').show();
		 }
		$('#txtFecha_Group').val(results.rows.item(0).ExpenseGroupDate);
		$('#txtName_Group').val(results.rows.item(0).Name);
		$('#txtDescription_Group').val(results.rows.item(0).Description);
		$("#cmbDepartment option[value='" + results.rows.item(0).idDepartment + "']").attr("selected",true);
		$("#cmbProject option[value='" + results.rows.item(0).idProject + "']").attr("selected",true);
		//Buscamos si tiene gastos asignados ...
		db2 = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	    db2.transaction(function (tx2) {

		var query='SELECT Expense.id,Expense.Status, ExpenseType.ItemGroupId as TipoGasto, ExpenseType.ItemGroupDescription as ExpenseType,Km,ImporteKm,Currency,Amount,Description,ExpenseDate, Image FROM Expense INNER JOIN ExpenseType ON Expense.TipoGasto = ExpenseType.ItemId WHERE Expense_NG_Id=' + results.rows.item(0).id + ' ORDER BY Status, ExpenseDate';

		tx2.executeSql(query, [], 
		function (tx2, rs) {
		    var len = rs.rows.length, i;
			var gastos="";
			var cont = 0;
			for (i = 0; i < len; i++){
				gastos+='<li id="Gasto'+rs.rows.item(i).id+'"><p class="ui-li-aside">'+rs.rows.item(i).ExpenseDate+'<br>'+rs.rows.item(i).ExpenseType +'</p>' + rs.rows.item(i).Description + '<br>'+rs.rows.item(i).Amount+' ' +rs.rows.item(i).Currency +'</li>';
				cont++;
			}
			$("#ListaGastoAnexado").append('<li data-role="list-divider">Gastos asociados<span class="ui-li-count">'+cont+'</span></li>');
			$("#ListaGastoAnexado").append(gastos);
			$("#ListaGastoAnexado").listview("refresh");

		}, function error() {
				alert ("Se ha producido un error al cargar los gastos asociados a la nota de gastos.");
		   }
	);
   });
	 	//Mostramos la ficha ...
		$.mobile.changePage("#AgregarNotaGastos");
		$("#cmbDepartment").selectmenu("refresh", true);
		$("#cmbProject").selectmenu("refresh", true);
	}									
}

function MuestraItem(tx, results) {

     var len = results.rows.length;
     if (len > 0) {
 		 ExpenseTypeList(results.rows.item(0).ItemGroupId);
		 /*if (results.rows.item(0).Status!=0)	//Si no está en borrador, ocultaremos los botones de guardar, tramitar, borrar y captura
		 {
			$('#save').hide();
			$('#delete').hide();
			$('#capture').hide();

		 }
		 else
		 {
		 	$('#save').show();
			$('#delete').show();
			$('#capture').show();
		 }
		 */
		$('#txtFecha').val(results.rows.item(0).ExpenseDate);
		$('#txtIdDeviceStatus').val(results.rows.item(0).IdDeviceStatus);
		$('#txtIdExpenseServer').val(results.rows.item(0).idExpense_Server);
		

		if (results.rows.item(0).ItemGroupId==1) //Trayecto
		{
			$('#txtDescription').hide();
			$('#txtImporteKm_ico').show(); $('#txtImporteKm').show();
			$('#txtKm_ico').show();$('#txtKm').show();
		}
		else
		 {
			$('#txtDescription').show();
			$('#txtImporteKm_ico').hide();$('#txtImporteKm').hide();
			$('#txtKm_ico').hide();$('#txtKm').hide();
		 }
		$('#txtDescription').val(results.rows.item(0).Description);
		$('#txtKm').val(results.rows.item(0).km);
		$('#txtImporteKm').val(results.rows.item(0).ImporteKm);
		$('#txtImporte').val(results.rows.item(0).Amount);

		
	  
		$('#txtImage').val(results.rows.item(0).Image);
		//Mostramos la ficha ...
		$.mobile.changePage("#Agregar");
		alert("asignaIni");
		$("#cmbCurrency option[value='" + results.rows.item(0).Currency + "']").attr("selected",true);
				alert("asignaFin");
				$("#cmbExpenseType option[value='" + results.rows.item(0).TipoGasto + "']").attr("selected",true);
		$("#cmbCurrency").selectmenu("refresh", true);
		  $("#cmbExpenseType").selectmenu("refresh", true);
	}									
}

function MuestraItems(tx, results) {
    var len = results.rows.length;
	var borrador=""; var countBorrador=0;
	var enTramite=""; var countEnTramite=0;
	var aprobadas=""; var countAprobadas=0;
	var denegadas=""; var countDenegadas=0;
	$("#ListaItem").empty();
	$("#ListaGastosDisponibles").empty();

    for (var i=0; i<len; i++){
		//addExpenses sirve para diferenciar el listado de gastos candidatos de ser asignados a una Nota de Gastos del listado común de gastos...
		if (addExpenses)
		{
			borrador+='<li id="Gasto'+results.rows.item(i).id+'"><p class="ui-li-aside">'+results.rows.item(i).ExpenseDate+'<br>'+results.rows.item(i).ExpenseType +'</p>' + results.rows.item(i).Description + '<br>'+results.rows.item(i).Amount+' ' +results.rows.item(i).Currency +'</li>';
			countBorrador++;
		}
		else
		{
			borrador+='<li id="'+results.rows.item(i).id+'"><img src="images/ng.png" style="width: 60px; height: 60px; float: left;"/><p class="ui-li-aside">'+results.rows.item(i).ExpenseDate+'<br>'+results.rows.item(i).ExpenseType +'</p>' + results.rows.item(i).Description + '<br>'+results.rows.item(i).Amount+' ' +results.rows.item(i).Currency +'</li>';
			countBorrador++;
		 }
	}

	
	if (addExpenses)
	   {
		//borrador
		$("#ListaGastosDisponibles").append('<li data-role="list-divider">Borrador<span class="ui-li-count">'+countBorrador+'</span></li>');
		$("#ListaGastosDisponibles").append(borrador);
		$('#ListaGastosDisponibles').listview('refresh');
		addExpenses=false;
	}
	else
	{
		//borrador
		$("#ListaItem").append('<li data-role="list-divider">Borrador<span class="ui-li-count">'+countBorrador+'</span></li>');
		$("#ListaItem").append(borrador);
		$('#ListaItem').listview('refresh');
	}
}


function MuestraNotasGastos(tx, results) {
	
    var len = results.rows.length;
	var borrador=""; var countBorrador=0;
	var enTramite=""; var countEnTramite=0;
	var aprobadas=""; var countAprobadas=0;
	var denegadas=""; var countDenegadas=0;
	$("#ListaNG").empty();
    for (var i=0; i<len; i++){
		//$("#Listar").append('<li class="ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-corner-top ui-btn-up-c" data-theme="c" data-iconpos="right" data-icon="arrow-r" data-wrapperels="div" data-iconshadow="true" data-shadow="false" data-corners="false"><img src="images/ng.png" style="width: 60px; height: 60px; float: left;"/><p class="ui-li-aside">'+results.rows.item(i).DateCreation+'<br>'+results.rows.item(i).ExpenseType +'</p>' + results.rows.item(i).Vendor + '<br>'+results.rows.item(i).Amount+' €<div class="ui-btn-inner ui-li ui-corner-top" id="NG'+results.rows.item(i).id+'"><div class="ui-btn-text" onclick="Borrar(1,'+results.rows.item(i).id+')">' + results.rows.item(i).Department+'</div><span class="ui-icon ui-icon-arrow-r ui-icon-shadow">&nbsp;</span></div></li>');
		//Status BORRADOR (Status=0)
		switch (results.rows.item(i).Status)
		{
			case 0: //borrador
  			    borrador+='<li id="'+results.rows.item(i).id+'"><img src="images/ng.png" style="width: 60px; height: 60px; float: left;"/><p class="ui-li-aside">'+results.rows.item(i).ExpenseGroupDate+'<br>'+results.rows.item(i).Department +'</p>' + results.rows.item(i).Name + '<br>' +results.rows.item(i).Project+'</li>';
				countBorrador++;
				break;
			case 1: //enTramite
				enTramite+='<li id="'+results.rows.item(i).id+'"><img src="images/ng.png" style="width: 60px; height: 60px; float: left;"/><p class="ui-li-aside">'+results.rows.item(i).ExpenseGroupDate+'<br>'+results.rows.item(i).Department +'</p>' + results.rows.item(i).Name + '<br>' +results.rows.item(i).Project+'</li>';
				countEnTramite++;
				break;
			case 2: //aprobadas
				aprobadas+='<li id="'+results.rows.item(i).id+'"><img src="images/ng.png" style="width: 60px; height: 60px; float: left;"/><p class="ui-li-aside">'+results.rows.item(i).ExpenseGroupDate+'<br>'+results.rows.item(i).Department +'</p>' + results.rows.item(i).Name + '<br>' +results.rows.item(i).Project+'</li>';
				countAprobadas++;
				break;
			case 3: //denegadas
				denegadas+='<li id="'+results.rows.item(i).id+'"><img src="images/ng.png" style="width: 60px; height: 60px; float: left;"/><p class="ui-li-aside">'+results.rows.item(i).ExpenseGroupDate+'<br>'+results.rows.item(i).Department +'</p>' + results.rows.item(i).Name + '<br>' +results.rows.item(i).Project+'</li>';
				countDenegadas++;
				break;
		}
    }

	//borrador
	$("#ListaNG").append('<li data-role="list-divider">Borrador<span class="ui-li-count">'+countBorrador+'</span></li>');
	$("#ListaNG").append(borrador);
	//en trámite
	$("#ListaNG").append('<li data-role="list-divider">En Tr&aacute;mite<span class="ui-li-count">'+countEnTramite+'</span></li>');
	$("#ListaNG").append(enTramite);
	//Aprobadas
	$("#ListaNG").append('<li data-role="list-divider">Aprobadas<span class="ui-li-count">'+countAprobadas+'</span></li>');
	$("#ListaNG").append(aprobadas);
	//Denegadas
	$("#ListaNG").append('<li data-role="list-divider">Denegadas<span class="ui-li-count">'+countDenegadas+'</span></li>');
	$("#ListaNG").append(denegadas);
	$('#ListaNG').listview('refresh');
}

function CurrencyList(){
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	alert("ini");
    db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM Currency ORDER BY Id', [], 
		function (tx, results) {
		    var len = results.rows.length, i;
			for (i = 0; i < len; i++){
				$("#cmbCurrency").append('<option value="' + results.rows.item(i).Id + '">' + results.rows.item(i).Description+ '</option>');
			}
			//$("#cmbCurrency").attr('data-native-menu','false');
			$("#cmbCurrency").selectmenu("refresh");
				alert("fin");
		}, function error() {
				alert ("Se ha producido un error al cargar las divisas.");
		   }
	);
   });
 }

 function removeExpenseToNg (idExpense)
 {
	 $('#ListaGastoAnexado > #Gasto' +idExpense).remove();
	 db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
	 db.transaction(function (tx) {
			var query='UPDATE Expense SET Expense_NG_Id=0 WHERE id=' +idExpense;
			tx.executeSql(query, [], 
						   function () {}
			, function error() {
					alert ("Se ha producido al desasignar el gasto a la nota de gastos.");
			   }
		   );
	   });
 }

function addExpenseToNg(idExpense)
{
	idExpense=idExpense.substring(5);		//Le quitamos el prefijo "GASTO".		
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
    db.transaction(function (tx) {
		var query='SELECT Expense.*,ExpenseType.ItemDescription FROM Expense INNER JOIN ExpenseType ON Expense.TipoGasto = ExpenseType.ItemId WHERE Expense.id=' +idExpense;
		tx.executeSql(query, [], 
			function (tx, results) {
			 var len = results.rows.length, i;
			 var item=null;
 			 for (i = 0; i < len; i++){
				 item=$('#Gasto'+results.rows.item(i).id);
				 $("#ListaGastoAnexado").append(item);
				 //$("#ListaGastosDisponibles").children().remove(item);
				 //Gastoa anexado: Updatamos la nota de gastos con el gasto seleccionado.
				$('#ListaGastosDisponibles > #Gasto' +idExpense).remove();
				 db2 = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
				 db2.transaction(function (tx2) {
	 				    var query2='UPDATE Expense SET Expense_NG_Id='+idNotaGastos+' WHERE id=' +idExpense;
						tx2.executeSql(query2, [], 
									   function () {}
						, function error() {
								alert ("Se ha producido al asignar el gasto a la nota de gastos.");
						   }
					   );
				   });
				
			 }
			$("#ListaGastoAnexado").listview("refresh");
			$("#ListaGastosDisponibles").listview("refresh");
			}, 
			function error() {
				alert ("Se ha producido un error al cargar los gastos seleccionados.");
			  }
		);
   });
}

 function DepartmentList(){
   //$("#cmbDepartament").empty();
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
    db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM Department', [], 
		function (tx, results) {
		    var len = results.rows.length, i;
			for (i = 0; i < len; i++){
				$("#cmbDepartment").append('<option value="' + results.rows.item(i).Id + '">' + results.rows.item(i).Description+ '</option>');
						
			}
			//$("#cmbDepartamento").attr('data-native-menu','false');
			$("#cmbDepartment").selectmenu("refresh",true);
		}, function error() {
				alert ("Se ha producido un error al cargar los departamentos.");
		   }
	);
   });
 }
function ProjectList(){
    //$("#cmbProject").empty();
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
    db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM Project ORDER by Name', [], 
			function (tx, results) {
				var len = results.rows.length, i;
				for (i = 0; i < len; i++){
					$("#cmbProject").append('<option value="' + results.rows.item(i).Id + '">' + results.rows.item(i).Name+ '</option>');
				}
				$("#cmbProject").selectmenu("refresh",true);
			}, function error() {
					alert ("Se ha producido un error al cargar los proyectos.");
			   }
		);
   });
 }

 function ExpenseTypeList(tipoGasto){
	$("#cmbExpenseType").empty();
	db = window.openDatabase("BTMobile.db3", "1.0", "Business Traveller Mobile", 30 * 1024);
    db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM ExpenseType WHERE ItemGroupId=' + tipoGasto + ' ORDER BY ItemDescription', [], 
		function (tx, results) {
		    var len = results.rows.length, i;
			for (i = 0; i < len; i++){
				$("#cmbExpenseType").append('<option value="' + results.rows.item(i).ItemId + '">' + results.rows.item(i).ItemDescription+ '</option>');
			}
			//$("#cmbExpenseType").attr('data-native-menu','false');
			$("#cmbExpenseType").selectmenu("refresh");
		}, function error() {
				alert ("Se ha producido un error al cargar los tipos de gasto.");
		   }
	);
   });
 }

 //FUNCIONES DE CAPTURA DE IMÁGENES (PARA TOMAR LA FOTO DE LA NG
//************************************************************************************************************
// Called when capture operation is finished
    //
    function captureSuccess(mediaFiles) {
        var i, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            //uploadFile(mediaFiles[i]);
			alert("foto: " + mediaFiles[i].fullPath + " " + mediaFiles[i].name);
			//var smallImage = document.getElementById('smallImage');
   			 //smallImage.src = "data:image/jpeg;base64," + mediaFiles[i];
			 $("#txtImage").val(mediaFiles[i].fullPath);
			 $('#imgClip').css("display","block");
        }
    }

    // Called if something bad happens.
    // 
    function captureError(error) {
        var msg = 'An error occurred during capture: ' + error.code;
        navigator.notification.alert(msg, null, 'Error');
    }

    // A button will call this function
    //
    function captureImage() {
        // Launch device camera application, 
        // allowing user to capture up to 2 images
		try
		  {
			navigator.device.capture.captureImage(captureSuccess, captureError, {limit: 1});
		  }
		  catch (err) {
			  alert("err: " + err);
		  }
    }

    // Upload files to server
    function uploadFile(mediaFile) {
        var ft = new FileTransfer(),
		path = mediaFile.fullPath,
		name = mediaFile.name;
        ft.upload(path,
            "http://my.domain.com/upload.php",
            function(result) {
                console.log('Upload success: ' + result.responseCode);
                console.log(result.bytesSent + ' bytes sent');
            },
            function(error) {
                console.log('Error uploading file ' + path + ': ' + error.code);
            },
            { fileName: name });   
    }

	/*Check de conexión*/
	function isOnLine() {
		if (isMobile)
		{
			var networkState = navigator.network.connection.type;
		   /* var states = {};
			states[Connection.UNKNOWN]  = 'Estado desconocido';
			states[Connection.ETHERNET] = 'Conexi&oacute;n Ethernet';
			states[Connection.WIFI]     = 'Conexi&oacute;n WiFi';
			states[Connection.CELL_2G]  = 'Conexi&oacute;n 2G';
			states[Connection.CELL_3G]  = 'Conexi&oacute;n 3G';
			states[Connection.CELL_4G]  = 'Conexi&oacute;n 4G';
			states[Connection.NONE]     = 'Sin red';
			//alert('Connection type: ' + states[networkState]);
			*/
				return (networkState!=Connection.NONE)
		}
		else 
		{
			return true;
		}
	

    }