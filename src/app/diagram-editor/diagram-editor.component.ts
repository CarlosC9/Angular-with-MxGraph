import { Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { mxgraph } from 'mxgraph';
import { LineToLineMappedSource } from 'webpack-sources';

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
  private arrowsEditing: number = 0;
  private sourceArrow: mxgraph.mxCell;
  private statePrintArrow: number = 0;
  private printArrow;

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

      let arrow1: HTMLImageElement = document.createElement("img");
      arrow1.setAttribute("src", "assets/img/diagonal-arrow.png");
      arrow1.setAttribute("alt", "arrow1");
      arrow1.ondragstart = () => { return false; };
      let funClickArrow1 = (evt) => {
        this.arrowsEditing = 1;
        let cells: Object[] = this.graph.getChildVertices(this.graph.getDefaultParent());
        this.graph.setCellStyles(mx.mxConstants.STYLE_MOVABLE, "0", cells);
        this.graph.setCellStyles(mx.mxConstants.STYLE_EDITABLE, "0", cells);
        let gElements = document.getElementsByTagName("g");
        for (let i = 0; i < gElements.length; i++) {
          gElements[i].style.cursor = "pointer";
        }
      }
      arrow1.addEventListener("click", funClickArrow1.bind(this));
      this.toolbarContainer.nativeElement.append(arrow1);

      this.createEventsGraph();

      this.graph.convertValueToString = function (cell) {
        if (mx.mxUtils.isNode(cell.value)) {

          var name = cell.getAttribute('name', '');

          return name;

        }

        return '';
      };

      var cellLabelChanged = this.graph.cellLabelChanged;
      let funCellLabelChanged = (cell: mxgraph.mxCell, newValue, autoSize) => {
        if (mx.mxUtils.isNode(cell.value)) {
          try {

            var edit = {
              cell: cell,
              attribute: "name",
              value: newValue,
              previous: newValue,
              execute: function () {
                if (this.cell != null) {
                  var tmp = this.cell.getAttribute(this.attribute);

                  if (this.previous == null) {
                    this.cell.value.removeAttribute(this.attribute);
                  }
                  else {
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

            let popup = document.getElementById("popup");

            popup.style.display = "block";

            popup.innerHTML = "";
            popup.append(this.createButtonClosePopup());


            for (let i = 0; i < cell.value.attributes.length; i++) {
              let type = cell.value.attributes[i].name;
              let value = cell.value.attributes[i].nodeValue;
              popup.append(this.createInputForPopup(cell.id, type, value));
            }


          }
        }
      }

      this.graph.cellLabelChanged = funCellLabelChanged.bind(this);

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
      interfaceType.setAttribute('property_1', '');

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

  private createEventsGraph() {

    this.graph.addMouseListener(
      {
        mouseDown: this.mouseDownGraph.bind(this),
        mouseMove: this.mouseMoveArrow.bind(this),
        mouseUp: this.mouseUpGraph.bind(this),
      }
    )
    this.graph.addListener(mx.mxEvent.DOUBLE_CLICK, this.doubleClickGraph.bind(this));

  }

  private mouseDownGraph(sender, mouseEvent: mxgraph.mxMouseEvent) {
    let pointerEvent = mouseEvent.getEvent();
    if (pointerEvent.button == 0) {
      let cell: mxgraph.mxCell = mouseEvent.getCell();
      if (cell != null) {
        if (this.arrowsEditing == 1 || this.arrowsEditing == 2) {
          this.sourceArrow = cell;
          this.statePrintArrow = 1;

          let line: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.id = "print-line";
          let cellCenterX: number = cell.getGeometry().x + (cell.getGeometry().width / 2);
          let cellCenterY: number = cell.getGeometry().y + (cell.getGeometry().height / 2);
          line.setAttribute("x1", cellCenterX.toString());
          line.setAttribute("x2", cellCenterX.toString());
          line.setAttribute("y1", cellCenterY.toString());
          line.setAttribute("y2", cellCenterY.toString());
          line.style.stroke = "black";
          line.style.strokeWidth = "2";
          document.getElementsByTagName("svg")[0].append(line);
        }
      } else {
        this.cancelArrow();
      }
    }

  }

  private mouseMoveArrow(sender, mouseEvent: mxgraph.mxMouseEvent) {
    if (this.statePrintArrow == 1) {
      let line: HTMLElement = document.getElementById("print-line");
      let positionX = parseInt(mouseEvent.getGraphX()) - 1;
      let positionY = parseInt(mouseEvent.getGraphY()) - 1;
      line.setAttribute("x2", positionX.toString());
      line.setAttribute("y2", positionY.toString());
    }
  }

  private mouseUpGraph(sender, mouseEvent: mxgraph.mxMouseEvent) {
    console.log("enter mouseUp");
    let pointerEvent = mouseEvent.getEvent();
    if (pointerEvent.button == 0 && (this.arrowsEditing == 1 || this.arrowsEditing == 2)) {
      let cell: mxgraph.mxCell = mouseEvent.getCell();
      if (cell != null) {
        switch (this.arrowsEditing) {
          case 1:
            let doc = mx.mxUtils.createXmlDocument();

            let parentType = doc.createElement('parenttype');
            parentType.setAttribute('name', 'ParentType');
            parentType.setAttribute('property_1', '');
            this.graph.insertEdge(this.graph.getDefaultParent(), null, parentType, this.sourceArrow, cell, 'strokeColor=#000000;perimeterSpacing=4;labelBackgroundColor=white;fontStyle=1');
        }
      }
      this.cancelArrow();
      document.getElementById("print-line").remove();
    }
  }

  private cancelArrow() {
    this.arrowsEditing = 0;
    this.statePrintArrow = 0;
    let cells: Object[] = this.graph.getChildVertices(this.graph.getDefaultParent());
    this.graph.setCellStyles(mx.mxConstants.STYLE_MOVABLE, "1", cells);
    this.graph.setCellStyles(mx.mxConstants.STYLE_EDITABLE, "1", cells);
    let gElements = document.getElementsByTagName("g");
    for (let i = 0; i < gElements.length; i++) {
      gElements[i].style.cursor = "move";
    }
  }


  private doubleClickGraph(sender, evt) {

    let cell = evt.getProperty('cell');

    if (cell != null) {

      console.log(cell);

      if (mx.mxUtils.isNode(cell.value)) {
        let popup = document.getElementById("popup");

        popup.style.display = "block";

        popup.innerHTML = "";
        popup.append(this.createButtonClosePopup());


        for (let i = 0; i < cell.value.attributes.length; i++) {
          let type = cell.value.attributes[i].name;
          let value = cell.value.attributes[i].nodeValue;
          popup.append(this.createInputForPopup(cell.id, type, value));
        }

      }


    }
  }


  private createButtonClosePopup(): HTMLImageElement {
    let img: HTMLImageElement = document.createElement("img");
    img.setAttribute("src", "assets/img/icon_close_popup.png");
    img.setAttribute("alt", "close");
    img.style.position = "absolute";
    img.style.right = "6px";
    img.style.top = "4px";
    img.style.width = "20px";
    img.style.cursor = "pointer";

    img.addEventListener("click", (evt) => {
      let popup: HTMLDivElement = <HTMLDivElement>(<HTMLElement>evt.target).parentElement;
      popup.style.display = "none";
    })

    return img;
  }

  private createInputForPopup(id: string, type: string, value: string): HTMLDivElement {

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

    let inputTarget = <HTMLInputElement>evt.target;
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
          execute: function () {
            if (this.cell != null) {
              var tmp = this.cell.getAttribute(this.attribute);

              if (this.previous == null) {
                this.cell.value.removeAttribute(this.attribute);
              }
              else {
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
