import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
      this.encoder = new mx.mxCodec(null);
      this.addVertexToolbar('assets/mxgraph/rectangle.gif', 100, 40, 'resizable=0;rounded=1;');
      this.addVertexToolbar('assets/mxgraph/rectangle.gif', 50, 50, '');
      this.graph.getSelectionModel().addListener(mx.mxEvent.CHANGE, function(sender, evt)
				{
          DiagramEditorComponent.selectionChanged(this.graph);
        });
        
    }
    
  }

  private addVertexToolbar(icon , w : number, h : number, style) {

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

    this.saveData(xml, "test.xml");
  }

  private getDIagramXML() {
    let result = this.encoder.encode(this.graph.getModel());

    return mx.mxUtils.getXml(result);
  }

  private saveData(data, fileName) {
    
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    let blob = new Blob([data], {type: "text/xml;charset=utf-8"}),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

  }

  static selectionChanged(graph) {

    let cell = graph.getSelectionCell();
    let popup =  document.getElementById('popup')

    if (cell == null) {
      popup.style.display = "none";
    } else {
      popup.style.display = "block";
    }
  }
  

}
