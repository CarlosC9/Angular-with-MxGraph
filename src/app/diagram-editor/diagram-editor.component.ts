import { Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { mxgraph } from 'mxgraph';

declare var require: any;

const parser = require('xml2json-light');

const mx: typeof mxgraph = require('mxgraph')({
	mxBasePath: 'mxgraph'
});

@Component({
  selector: 'app-diagram-editor',
  templateUrl: './diagram-editor.component.html',
  styleUrls: ['./diagram-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DiagramEditorComponent implements AfterViewInit {

  @ViewChild('graphContainer', {static:false}) graphContainer: ElementRef;
  @ViewChild('toolbar', {static:false}) toolbarContainer : ElementRef;
  @ViewChild('saveLocalXML', {static:false}) saveLocalXMLInput : ElementRef;

  private graph: mxgraph.mxGraph;
  private toolbar : mxgraph.mxToolbar;
  private encoder : mxgraph.mxCodec;

  constructor() { }

  ngAfterViewInit() {

    if (!mx.mxClient.isBrowserSupported()) {

      mx.mxUtils.error('Browser is not supported!', 200, false);

    } else {

      this.graph = new mx.mxGraph(this.graphContainer.nativeElement);
      this.toolbar = new mx.mxToolbar(this.toolbarContainer.nativeElement);
      this.toolbar.enabled = false;
      this.encoder = new mx.mxCodec(null);
      
      
      this.addToolbarInterfaceType('assets/mxgraph/rectangle.gif');
      
      this.createEventDoubleClickGraph();

    }
    
  }

    private addToolbarInterfaceType(icon) {
    
    var funct = function(graph : mxgraph.mxGraph, evt, cell)
		{
			graph.stopEditing(false);

      var pt = graph.getPointForEvent(evt);
      console.log(pt);
      
      let doc = mx.mxUtils.createXmlDocument();

      let interfaceType = doc.createElement('interfacetype');
			interfaceType.setAttribute('name', 'InterfaceType');
					
      graph.insertVertex(graph.getDefaultParent(),null,interfaceType,pt.x,pt.y,100,40,'resizable=0;rounded=1;');
		}

			
      var img = this.toolbar.addMode(null, icon, funct);
      mx.mxUtils.makeDraggable(img, this.graph, funct);

      
  }

  onSaveLocalXMLButtonClick() {

    let xml = this.getDIagramXML();
    let json = parser.xml2json(xml);

    //this.saveData(xml, "test.xml", "text/xml");
  }

  private getDIagramXML() {
    let result = this.encoder.encode(this.graph.getModel());

    return mx.mxUtils.getXml(result);
  }

  private saveData(data, fileName, type) {
    
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    let blob = new Blob([data], {type: type + ";charset=utf-8"}),
    url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

  }

  private createEventDoubleClickGraph() {
    console.log("create event");
    this.graph.addListener(mx.mxEvent.DOUBLE_CLICK, this.doubleClickGraph.bind(this))
  }

  private doubleClickGraph(sender,evt) {
    console.log("Double click");
    let cell = evt.getProperty('cell');
    
    if (cell != null) {
      let popup = document.getElementById("popup");

      popup.style.display = "block";

      popup.innerHTML = "";

      for (let i = 0; i < cell.value.attributes.length; i++) {
        let type = cell.value.attributes[i].name;
        let value = cell.value.attributes[i].nodeValue;
        popup.append(this.createInputForPopup(cell.id, type, value));
      }
      
    }
  }



  private createInputForPopup(id : string, type : string, value : string) {

    let div : HTMLDivElement = document.createElement("div");

    let strong :HTMLElement  = document.createElement("strong");
    strong.innerText = type;
    
    let input : HTMLInputElement = document.createElement('input');
    input.setAttribute("data-type",type);
    input.setAttribute("type","type");
    input.setAttribute("data-cell-id",id);
    input.value = value;
    
    input.addEventListener("input", this.changeAttributeCell.bind(this));

    div.append(strong);
    div.append(input);
    
    return div;
  }

  private changeAttributeCell(evt) {
    
    let inputTarget = <HTMLInputElement> evt.target;
    let type = inputTarget.getAttribute("data-type");
    let id = inputTarget.getAttribute("data-cell-id");
    let value = inputTarget.value;

    let cell = this.graph.getModel().getCell(id);
    console.log(cell.value.attributes[type]);

    cell.value.attributes[type].nodeValue = value;
    

  }



}
