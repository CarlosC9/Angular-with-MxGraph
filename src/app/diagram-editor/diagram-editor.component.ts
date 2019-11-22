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

  @ViewChild('graphContainer', { static: false }) graphContainer: ElementRef;
  @ViewChild('toolbar', { static: false }) toolbarContainer: ElementRef;
  @ViewChild('saveLocalXML', { static: false }) saveLocalXMLInput: ElementRef;

  private graph: mxgraph.mxGraph;
  private toolbar: mxgraph.mxToolbar;
  private encoder: mxgraph.mxCodec;

  constructor() { }

  ngAfterViewInit() {

    if (!mx.mxClient.isBrowserSupported()) {

      mx.mxUtils.error('Browser is not supported!', 200, false);

    } else {

      this.graph = new mx.mxGraph(this.graphContainer.nativeElement);
      var style = this.graph.getStylesheet().getDefaultVertexStyle();
      style[mx.mxConstants.STYLE_FONTCOLOR] = 'black';
      style[mx.mxConstants.STYLE_FONTSIZE] = '12';
      style[mx.mxConstants.STYLE_SPACING] = 4;
      this.toolbar = new mx.mxToolbar(this.toolbarContainer.nativeElement);
      this.toolbar.enabled = false;
      this.encoder = new mx.mxCodec(null);


      this.addToolbarInterfaceType('assets/mxgraph/rectangle.gif');

      this.createEventDoubleClickGraph();

      this.graph.convertValueToString = function (cell) {
        if (mx.mxUtils.isNode(cell.value)) {
          if (cell.value.nodeName.toLowerCase() == 'interfacetype') {
            var name = cell.getAttribute('name', '');

            return name;
          }

        }

        return 'CELL';
      };

      var cellLabelChanged = this.graph.cellLabelChanged;
      this.graph.cellLabelChanged = function (cell : mxgraph.mxCell, newValue, autoSize) {
        if (mx.mxUtils.isNode(cell.value) &&
          cell.value.nodeName.toLowerCase() == 'interfacetype') {

          var elt = cell.value.cloneNode(true);
          elt.setAttribute('name', newValue);
          newValue = elt;
          autoSize = true;
        }

        cellLabelChanged.apply(this, arguments);
      };

      this.graph.getEditingValue = function (cell) {
        if (mx.mxUtils.isNode(cell.value) &&
          cell.value.nodeName.toLowerCase() == 'interfacetype') {
          var name = cell.getAttribute('name', '');

          return name;
        }
      };

    }

  }

  private addToolbarInterfaceType(icon) {

    var funct = function (graph: mxgraph.mxGraph, evt, cell) {

      graph.stopEditing(false);

      var pt = graph.getPointForEvent(evt);

      let doc = mx.mxUtils.createXmlDocument();

      let interfaceType = doc.createElement('interfacetype');
      interfaceType.setAttribute('name', 'InterfaceType');
      interfaceType.setAttribute('property_1', 'property1');

      graph.insertVertex(graph.getDefaultParent(), null, interfaceType, pt.x, pt.y, 90, 30, 'resizable=0;rounded=1;');

    }


    var img = this.toolbar.addMode(null, icon, funct);
    mx.mxUtils.makeDraggable(img, this.graph, funct);


  }

  onSaveLocalXMLButtonClick() {

    let xml = this.getDIagramXML();
    let json = parser.xml2json(xml);

    console.log(xml);

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

    let blob = new Blob([data], { type: type + ";charset=utf-8" }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

  }

  private createEventDoubleClickGraph() {

    this.graph.addListener(mx.mxEvent.DOUBLE_CLICK, this.doubleClickGraph.bind(this));

  }

  private doubleClickGraph(sender, evt) {

    let cell = evt.getProperty('cell');

    if (cell != null) {

      if (mx.mxUtils.isNode(cell.value)) {
        let popup = document.getElementById("popup");

        popup.style.display = "block";

        popup.innerHTML = "";

        if (cell.value.nodeName.toLowerCase() == 'interfacetype') {
          for (let i = 0; i < cell.value.attributes.length; i++) {
            let type = cell.value.attributes[i].name;
            let value = cell.value.attributes[i].nodeValue;
            popup.append(this.createInputForPopup(cell.id, type, value));
          }
        }
      }


    }
  }



  private createInputForPopup(id: string, type: string, value: string) {

    let div: HTMLDivElement = document.createElement("div");

    let strong: HTMLElement = document.createElement("strong");
    strong.innerText = type.replace("_", " ");

    let input: HTMLInputElement = document.createElement('input');
    input.setAttribute("data-type", type);
    input.setAttribute("type", "text");
    input.setAttribute("data-cell-id", id);
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

    let cell = this.graph.getModel().getCell(id);

    var newValue = inputTarget.value;
    var oldValue = cell.getAttribute(type, '');

    if (newValue != oldValue) {
      this.graph.getModel().beginUpdate();

      try {

        var edit = {
          cell: cell,
	        attribute: type,
	        value: newValue,
          previous: newValue,
          execute: function()
          {
            if (this.cell != null)
            {
              var tmp = this.cell.getAttribute(this.attribute);
              
              if (this.previous == null)
              {
                this.cell.value.removeAttribute(this.attribute);
              }
              else
              {
                this.cell.setAttribute(this.attribute, this.previous);
              }
              
              this.previous = tmp;
            }
          }
        };



        this.graph.getModel().execute(edit);
        this.graph.updateCellSize(cell);
      }
      finally {
        this.graph.getModel().endUpdate();
      }
    }
  }



}
