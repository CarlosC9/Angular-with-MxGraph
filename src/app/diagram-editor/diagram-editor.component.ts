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
      
      this.addVertexToolbar('assets/mxgraph/rectangle.gif', 100, 40, 'resizable=0;rounded=1;');
      
      this.evtDoubleClick();

    }
    
  }

  private addVertexToolbar(icon : string , w : number, h : number, style : string) {

    var vertex = new mx.mxCell(null, new mx.mxGeometry(0, 0, w, h), style);
    vertex.setVertex(true);
				
    this.addToolbarItem(vertex, icon);
    
  }

  private addToolbarItem(prototype, image) {
    
    var funct = function(graph, evt, cell)
		{
			graph.stopEditing(false);

			var pt = graph.getPointForEvent(evt);
			var vertex = graph.getModel().cloneCell(prototype);
			vertex.geometry.x = pt.x;
			vertex.geometry.y = pt.y;
					
			graph.setSelectionCells(graph.importCells([vertex], 0, 0, cell));
		}

			
      var img = this.toolbar.addMode(null, image, funct);
      mx.mxUtils.makeDraggable(img, this.graph, funct);
  }

  onSaveLocalXMLButtonClick() {

    let xml = this.getDIagramXML();
    let json = parser.xml2json(xml);
    
    console.log( "Test XML/JSON:\n" + JSON.stringify(json) + "\n\n" + xml);

    this.saveData(xml, "test.xml", "text/xml");
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

  private evtDoubleClick() {

    this.graph.addListener(mx.mxEvent.DOUBLE_CLICK, function(sender, evt)
    {
      let cell = evt.getProperty('cell');
      console.log(cell.id);
      
      if (cell != null) {
        let popup = document.getElementById("popup");

        popup.style.display = "block";

        popup.innerHTML = "";
        
        var inputs = popup.getElementsByTagName("input");

        for (let i = 0; i < inputs.length; i++) {
          
          inputs[i].addEventListener("change", (evt) => {
            //let type = evt.target.getAttribute("data-type");
          });

        }
      }
    });
  }

  private popupInput(label,type) {

    if (type = "value") {
      label = "Nombre";
    }
    
    let div : HTMLDivElement = document.createElement("div");

    let strong  = document.createElement("strong");
    
    let input : HTMLInputElement = document.createElement('input');
    input.setAttribute("data-type","value");
    input.setAttribute("type","text");
    
  }

}
