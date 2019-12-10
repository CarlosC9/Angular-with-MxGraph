import { Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { mxgraph } from 'mxgraph';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagramsService } from '../services/diagrams.service';
import { HttpErrorResponse } from '@angular/common/http';

var convertXMLJSON = require('xml-js');

declare var require: any;

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

  public static readonly ARROW_NOT_CREATE = 0;
  public static readonly ARROW_CREATE_PARENT = 1;
  public static readonly ARROW_CREATE_SCALE = 2;

  private graph: mxgraph.mxGraph;
  private toolbar: mxgraph.mxToolbar;
  private encoder: mxgraph.mxCodec;
  private typeArrowCreate: number = 0;
  private sourceCell: mxgraph.mxCell;
  private statePrintArrow: number = 0;

  constructor(
    private route: ActivatedRoute,
    private diagramService: DiagramsService,
    private router: Router,
  ) { }

  ngAfterViewInit() {

    if (!mx.mxClient.isBrowserSupported()) {

      mx.mxUtils.error('Browser is not supported!', 200, false);

    } else {

      window['mxEditor'] = mx.mxEditor;
      window['mxGeometry'] = mx.mxGeometry;
      window['mxDefaultKeyHandler'] = mx.mxDefaultKeyHandler;
      window['mxDefaultPopupMenu'] = mx.mxDefaultPopupMenu;
      window['mxGraph'] = mx.mxGraph;
      window['mxCell'] = mx.mxCell;
      window['mxCellPath'] = mx.mxCellPath;
      window['mxGraph'] = mx.mxGraph;
      window['mxStylesheet'] = mx.mxStylesheet;
      window['mxDefaultToolbar'] = mx.mxDefaultToolbar;
      window['mxGraphModel'] = mx.mxGraphModel;

      this.getDiagramId();

      this.graph = new mx.mxGraph(this.graphContainer.nativeElement);
      var style = this.graph.getStylesheet().getDefaultVertexStyle();
      style[mx.mxConstants.STYLE_FONTCOLOR] = 'black';
      style[mx.mxConstants.STYLE_FONTSIZE] = '12';
      style[mx.mxConstants.STYLE_SPACING] = 4;
      this.toolbar = new mx.mxToolbar(this.toolbarContainer.nativeElement);
      this.toolbar.enabled = false;
      this.encoder = new mx.mxCodec(null);

      this.addToolbarInterfaceType('assets/mxgraph/rectangle.gif');
      this.createIconsEdges();
      this.createEventsGraph();
      this.eventsModal();

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
        if (mx.mxUtils.isNode(cell.value)) {
          var name = cell.getAttribute('name', '');

          return name;
        }
      };

    }

  }

  private getDiagramId() {
    let id = this.route.snapshot.paramMap.get("id");
    if (id != null) {

      this.diagramService.getDiagram(id).subscribe(
        (data) => {
          console.log(data);
          let xml = convertXMLJSON.js2xml(data, { compact: true, spaces: 0 });
          console.log(xml);
          this.graph.getModel().beginUpdate();
          try {
            var doc = mx.mxUtils.parseXml(xml);
            var codec = new mx.mxCodec(doc);
            codec.decode(doc.documentElement, this.graph.getModel());
            //this.graph.fit();
          } catch (error) {
            console.log(error);
          } finally {
            this.graph.getModel().endUpdate();
          }

        },
        (errorResponse: HttpErrorResponse) => {
          if (errorResponse.status == 401) {
            this.router.navigateByUrl("login");
          }
        }
      )

      let buttonsDownWithId = document.getElementsByClassName("button-down-id");
      for (let i = 0; i < buttonsDownWithId.length; i++) {
        let button = <HTMLButtonElement>buttonsDownWithId[i];
        button.style.display = "inline-block";
      }

    } else {
      let buttonsDownWithId = document.getElementsByClassName("button-down-id");
      for (let i = 0; i < buttonsDownWithId.length; i++) {
        let button = <HTMLButtonElement>buttonsDownWithId[i];
        button.remove();
      }
    }
  }

  private createIconsEdges() {

    let funTransparentIcon = () => {
      let icons: HTMLElement[] = this.toolbarContainer.nativeElement.getElementsByTagName("img");
      for (let i = 0; i < icons.length; i++) {
        icons[i].style.backgroundColor = "transparent"
      }
    }

    let parentArrowImage: HTMLImageElement = document.createElement("img");
    parentArrowImage.id = "parent-arrow-img";
    parentArrowImage.setAttribute("src", "assets/img/diagonal-arrow.png");
    parentArrowImage.setAttribute("alt", "arrow1");
    parentArrowImage.ondragstart = () => { return false; };
    let funClickParentArrow = (evt) => {
      funTransparentIcon();
      let target = <HTMLElement>evt.target;
      target.style.backgroundColor = "#AFAFAF";
      this.typeArrowCreate = DiagramEditorComponent.ARROW_CREATE_PARENT;
      let cells: Object[] = this.graph.getChildVertices(this.graph.getDefaultParent());
      this.graph.setCellStyles(mx.mxConstants.STYLE_MOVABLE, "0", cells);
      this.graph.setCellStyles(mx.mxConstants.STYLE_EDITABLE, "0", cells);
      let gElements = document.getElementsByTagName("g");
      for (let i = 0; i < gElements.length; i++) {
        gElements[i].style.cursor = "pointer";
      }
    }
    parentArrowImage.addEventListener("click", funClickParentArrow.bind(this));
    this.toolbarContainer.nativeElement.append(parentArrowImage);

    let scaleChangeArrowImage: HTMLImageElement = document.createElement("img");
    scaleChangeArrowImage.id = "scale-change-arrow-img";
    scaleChangeArrowImage.setAttribute("src", "assets/img/diagonal-arrow.png");
    scaleChangeArrowImage.setAttribute("alt", "arrow1");
    scaleChangeArrowImage.ondragstart = () => { return false; };
    let funClickScaleChangeArrow = (evt) => {
      funTransparentIcon();
      let target = <HTMLElement>evt.target;
      target.style.backgroundColor = "#AFAFAF";
      this.typeArrowCreate = DiagramEditorComponent.ARROW_CREATE_SCALE;
      let cells: Object[] = this.graph.getChildVertices(this.graph.getDefaultParent());
      this.graph.setCellStyles(mx.mxConstants.STYLE_MOVABLE, "0", cells);
      this.graph.setCellStyles(mx.mxConstants.STYLE_EDITABLE, "0", cells);
      let gElements = document.getElementsByTagName("g");
      for (let i = 0; i < gElements.length; i++) {
        gElements[i].style.cursor = "pointer";
      }
    }
    scaleChangeArrowImage.addEventListener("click", funClickScaleChangeArrow.bind(this));
    this.toolbarContainer.nativeElement.append(scaleChangeArrowImage);
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
        if (cell.value.nodeName.toLowerCase() == 'interfacetype' && this.typeArrowCreate > DiagramEditorComponent.ARROW_NOT_CREATE) {

          this.sourceCell = cell;
          this.statePrintArrow = 1;

          let line: SVGLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.id = "print-line";
          let cellCenterX: number = cell.getGeometry().x + (cell.getGeometry().width / 2);
          let cellCenterY: number = cell.getGeometry().y + (cell.getGeometry().height / 2);
          line.setAttribute("x1", cellCenterX.toString());
          line.setAttribute("x2", cellCenterX.toString());
          line.setAttribute("y1", cellCenterY.toString());
          line.setAttribute("y2", cellCenterY.toString());
          switch (this.typeArrowCreate) {
            case DiagramEditorComponent.ARROW_CREATE_PARENT:
              line.style.stroke = "black";
              break;
            case DiagramEditorComponent.ARROW_CREATE_SCALE:
              line.style.stroke = "#05FF23";
              break;
          }
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
      let sourceX = parseInt(line.getAttribute("x1"));
      let sourceY = parseInt(line.getAttribute("y1"));
      let positionX;
      let positionY;

      if ((mouseEvent.getGraphX() - sourceX) > 0) {
        positionX = parseInt(mouseEvent.getGraphX()) - 1;
      } else {
        positionX = parseInt(mouseEvent.getGraphX()) + 1;
      }

      if ((mouseEvent.getGraphY() - sourceY) > 0) {
        positionY = parseInt(mouseEvent.getGraphY()) - 1;
      } else {
        positionY = parseInt(mouseEvent.getGraphY()) + 1;
      }

      line.setAttribute("x2", positionX.toString());
      line.setAttribute("y2", positionY.toString());
    }
  }

  private mouseUpGraph(sender, mouseEvent: mxgraph.mxMouseEvent) {

    let pointerEvent = mouseEvent.getEvent();

    if (pointerEvent.button == 0) {
      let cell: mxgraph.mxCell = mouseEvent.getCell();
      if (cell != null && cell.value.nodeName.toLowerCase() == 'interfacetype' && this.typeArrowCreate > DiagramEditorComponent.ARROW_NOT_CREATE) {
        switch (this.typeArrowCreate) {
          case DiagramEditorComponent.ARROW_CREATE_PARENT:
            try {
              if (this.sourceCell == cell) {
                throw new DiagramException(DiagramException.CONNECT_ITSELF, "A vertex cannot cannot be a parent of itself");
              }
              let edges: any[] = this.graph.getChildEdges(this.graph.getDefaultParent());
              for (let i = 0; i < edges.length; i++) {
                if (mx.mxUtils.isNode(edges[i].value) && edges[i].value.nodeName.toLowerCase() == 'parenttype'
                  && edges[i].target.id == cell.id)
                  throw new DiagramException(DiagramException.BAD_HIERARCHY, "A vertex cannot have two parents")
                else if ((edges[i].target.id == cell.id && edges[i].source.id == this.sourceCell.id) ||
                  (edges[i].source.id == cell.id && edges[i].target.id == this.sourceCell.id))
                  throw new DiagramException(DiagramException.DOUBLE_RELATIONSHIP, "Two vertex cannot have two relationship between each other");
              }
              let doc = mx.mxUtils.createXmlDocument();
              let parentType = doc.createElement('parenttype');
              parentType.setAttribute('name', 'ParentType');
              parentType.setAttribute('property_1', '');
              this.graph.insertEdge(this.graph.getDefaultParent(), null, parentType,
                this.sourceCell, cell, 'strokeColor=#000000;perimeterSpacing=4;labelBackgroundColor=white;fontStyle=1;movable=0');
            } catch (ex) {
              if (ex instanceof DiagramException) {
                let errorElement = document.getElementById("error-message");
                errorElement.innerText = ex.message;
                errorElement.style.display = "block";
                setTimeout(() => {
                  errorElement.style.display = "none";
                }, 5000)
              }
            }
            break;

          case DiagramEditorComponent.ARROW_CREATE_SCALE:
            try {
              if (this.sourceCell == cell) {
                throw new DiagramException(DiagramException.CONNECT_ITSELF, "A vertex cannot connect of itself")
              }
              let edges: any[] = this.graph.getChildEdges(this.graph.getDefaultParent());
              for (let i = 0; i < edges.length; i++) {
                if ((edges[i].target.id == cell.id && edges[i].source.id == this.sourceCell.id) ||
                  (edges[i].source.id == cell.id && edges[i].target.id == this.sourceCell.id))
                  throw new DiagramException(DiagramException.DOUBLE_RELATIONSHIP, "Two vertex cannot have two relationship between each other");
              }
              let doc = mx.mxUtils.createXmlDocument();
              let scaleChangeType = doc.createElement('scalechange');
              scaleChangeType.setAttribute('name', 'ScaleChange');
              scaleChangeType.setAttribute('property_1', '');
              this.graph.insertEdge(this.graph.getDefaultParent(), null, scaleChangeType,
                this.sourceCell, cell, 'strokeColor=#05FF23;perimeterSpacing=4;labelBackgroundColor=white;fontStyle=1;movable=0');
            } catch (ex) {
              if (ex instanceof DiagramException) {
                let errorElement = document.getElementById("error-message");
                errorElement.innerText = ex.message;
                errorElement.style.display = "block";
                setTimeout(() => {
                  errorElement.style.display = "none";
                }, 5000)
              }
            }
            break;

        }
      }
      this.cancelArrow();
      if (document.getElementById("print-line") != null)
        document.getElementById("print-line").remove();
    }
  }

  private cancelArrow() {
    let icons: HTMLElement[] = this.toolbarContainer.nativeElement.getElementsByTagName("img");
    for (let i = 0; i < icons.length; i++) {
      icons[i].style.backgroundColor = "transparent"
    }
    this.typeArrowCreate = DiagramEditorComponent.ARROW_NOT_CREATE;
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

  private eventsModal() {

    let modal = document.getElementById("myModal");
    let span = <HTMLElement>document.getElementsByClassName("close")[0];
    let formSave = <HTMLFormElement>document.getElementById("local-save-form");

    span.onclick = function () {
      modal.style.display = "none";
    }
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    let funFormSubmit = (evt) => {
      evt.preventDefault();
      modal.style.display = "none";
      let xml = this.getDiagramXML();
      let nameFile = evt.target.nameFile.value;
      if (nameFile == "")
        nameFile = "diagram.xml";
      else
        nameFile += ".xml";
      this.saveData(xml, nameFile, "text/xml");
    }
    formSave.addEventListener("submit", funFormSubmit.bind(this));

  }

  onSaveLocalXMLButtonClick() {
    let modal = document.getElementById("myModal");
    let formSave = <HTMLFormElement>document.getElementById("local-save-form");
    formSave.nameFile.value = "";

    modal.style.display = "block";
  }

  private getDiagramXML() {

    let result = this.encoder.encode(this.graph.getModel());

    return mx.mxUtils.getXml(result);

  }

  private saveData(data, fileName: string, type: string) {

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

  onSaveCloudButton() {
    let result = this.encoder.encode(this.graph.getModel());
    let xml = mx.mxUtils.getXml(result);
    console.log(xml);
    let DiagramJSON = convertXMLJSON.xml2js(xml, { compact: true, spaces: 0 });
    let id = this.route.snapshot.paramMap.get("id");
    this.diagramService.updateDiagram(id, DiagramJSON).subscribe(
      (data) => {

      }, (errorResponse: HttpErrorResponse) => {

      }
    );
  }

}

class DiagramException extends Error {

  static BAD_HIERARCHY: number = 1;
  static CONNECT_ITSELF: number = 2;
  static DOUBLE_RELATIONSHIP: number = 3;

  constructor(public type: number, public message: string) {
    super();
  }
}
