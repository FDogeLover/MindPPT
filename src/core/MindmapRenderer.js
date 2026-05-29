export class MindmapRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.onNodeClick = options.onNodeClick || (() => {});
    this.mindmap = null;
    this.mapLayer = null;
    this.linkLayer = null;
    this.nodeLayer = null;
    this.deckSubtitle = null;
    this.deckTitle = null;
    this.counter = null;
    this.controls = null;
    this.controlsBody = null;
    this.controlsToggle = null;
    this.nodeSlider = null;
    this.zoomSlider = null;
    this.zoomValue = null;
    this.activeScaleSlider = null;
    this.activeScaleValue = null;
    this.nextNodePreview = null;
    this.nextNodeSubtitle = null;
    this.nextNodeTitle = null;
    
    this.SVG_NS = "http://www.w3.org/2000/svg";
    this.layout = {
      minNodeWidth: 146,
      minNodeHeight: 57,
      pathGap: 99,
      rowGap: 75,
      stagePaddingX: 114,
      stagePaddingY: 72,
      centerBaseline: 520,
      cameraTargetCenterBand: 0.4,
    };
    this.wheelNavigation = {
      threshold: 72,
      idleResetMs: 180,
    };
    this.swipeNavigation = {
      intentDistance: 10,
      minDistance: 56,
      dominanceRatio: 1.25,
    };
    
    this.activeIndex = 0;
    this.root = null;
    this.preorder = [];
    this.idToNode = new Map();
    this.renderedNodes = new Map();
    this.renderedLinks = new Map();
    this.cameraTargetIndex = null;
    this.currentNodeMetrics = new Map();
    this.cameraZoom = 1;
    this.activeScale = 1.5;
    this.wheelDeltaBuffer = 0;
    this.wheelNavigationTimer = null;
    this.swipeStart = null;
    this.imageViewer = null;
  }

  init() {
    this.mindmap = this.container.querySelector("#mindmap");
    this.mapLayer = this.container.querySelector("#mapLayer");
    this.linkLayer = this.container.querySelector("#linkLayer");
    this.nodeLayer = this.container.querySelector("#nodeLayer");
    this.deckSubtitle = this.container.querySelector("#deckSubtitle");
    this.deckTitle = this.container.querySelector("#deckTitle");
    this.counter = this.container.querySelector("#counter");
    this.controls = this.container.querySelector(".controls");
    this.controlsBody = this.container.querySelector("#controlsBody");
    this.controlsToggle = this.container.querySelector("#controlsToggle");
    this.nodeSlider = this.container.querySelector("#nodeSlider");
    this.zoomSlider = this.container.querySelector("#zoomSlider");
    this.zoomValue = this.container.querySelector("#zoomValue");
    this.activeScaleSlider = this.container.querySelector("#activeScaleSlider");
    this.activeScaleValue = this.container.querySelector("#activeScaleValue");
    this.nextNodePreview = this.container.querySelector("#nextNodePreview");
    this.nextNodeSubtitle = this.container.querySelector("#nextNodeSubtitle");
    this.nextNodeTitle = this.container.querySelector("#nextNodeTitle");
    
    this.imageViewer = this.createImageViewer();
    this.bindEvents();
  }

  createImageViewer() {
    const overlay = document.createElement("div");
    overlay.classList.add("image-viewer");
    overlay.setAttribute("aria-hidden", "true");

    const frame = document.createElement("div");
    frame.classList.add("image-viewer-frame");
    frame.setAttribute("role", "dialog");
    frame.setAttribute("aria-modal", "true");
    frame.setAttribute("aria-label", "插图大图预览，点击任意位置关闭");

    const image = document.createElement("img");
    image.classList.add("image-viewer-img");
    let returnFocusTarget = null;

    frame.append(image);
    overlay.append(frame);
    document.body.append(overlay);

    const self = this;
    
    function open(src, alt) {
      returnFocusTarget = document.activeElement;
      image.src = src;
      image.alt = alt;
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("image-viewer-open");
    }

    function close() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("image-viewer-open");
      if (returnFocusTarget && document.contains(returnFocusTarget)) {
        returnFocusTarget.focus();
      }
      returnFocusTarget = null;
    }

    overlay.addEventListener("click", close);

    return {
      open,
      close,
      isOpen: () => overlay.classList.contains("open"),
    };
  }

  bindEvents() {
    if (this.controlsToggle) {
      this.controlsToggle.addEventListener("click", () => {
        const isCollapsed = this.controls.classList.toggle("collapsed");
        this.controlsBody.inert = isCollapsed;
        this.controlsBody.setAttribute("aria-hidden", String(isCollapsed));
        this.controlsToggle.setAttribute("aria-expanded", String(!isCollapsed));
        this.controlsToggle.setAttribute("aria-label", isCollapsed ? "展开控制面板" : "收起控制面板");
        this.controlsToggle.title = isCollapsed ? "展开控制面板" : "收起控制面板";
        this.controlsToggle.querySelector("span").textContent = isCollapsed ? "+" : "−";
      });
    }
    
    if (this.nodeSlider) {
      this.nodeSlider.addEventListener("input", (event) => {
        this.setActiveIndex(Number(event.target.value));
      });
    }
    
    if (this.zoomSlider) {
      this.zoomSlider.addEventListener("input", (event) => {
        this.cameraZoom = Number(event.target.value) / 100;
        this.render();
      });
    }
    
    if (this.activeScaleSlider) {
      this.activeScaleSlider.addEventListener("input", (event) => {
        this.activeScale = Number(event.target.value) / 100;
        this.render();
      });
    }
    
    window.addEventListener("keydown", (e) => this.handleKeydown(e));
    window.addEventListener("wheel", (e) => this.handleWheel(e), { passive: false });
    window.addEventListener("resize", () => this.render());
    
    if (this.mindmap) {
      this.mindmap.addEventListener("touchstart", (e) => this.handleTouchStart(e), { passive: true });
      this.mindmap.addEventListener("touchmove", (e) => this.handleTouchMove(e), { passive: false });
      this.mindmap.addEventListener("touchend", (e) => this.handleTouchEnd(e), { passive: false });
      this.mindmap.addEventListener("touchcancel", () => this.resetSwipeStart());
    }
  }

  handleKeydown(event) {
    if (this.imageViewer.isOpen()) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.imageViewer.close();
      }
      return;
    }

    const stepByKey = {
      ArrowDown: 1,
      PageDown: 1,
      ArrowUp: -1,
      PageUp: -1,
    };
    const step = stepByKey[event.key];
    if (step) {
      event.preventDefault();
      this.setActiveIndex(this.activeIndex + step);
    }
  }

  handleWheel(event) {
    if (this.imageViewer.isOpen() || event.ctrlKey || event.metaKey) {
      return;
    }

    const deltaY = this.normalizeWheelDeltaY(event);
    if (Math.abs(deltaY) < 1) {
      return;
    }

    event.preventDefault();

    if (this.wheelDeltaBuffer !== 0 && Math.sign(this.wheelDeltaBuffer) !== Math.sign(deltaY)) {
      this.wheelDeltaBuffer = 0;
    }
    this.wheelDeltaBuffer += deltaY;
    const step = Math.trunc(this.wheelDeltaBuffer / this.wheelNavigation.threshold);
    if (step === 0) {
      this.scheduleWheelBufferReset();
      return;
    }

    this.setActiveIndex(this.activeIndex + step);
    this.wheelDeltaBuffer -= step * this.wheelNavigation.threshold;
    this.scheduleWheelBufferReset();
  }

  scheduleWheelBufferReset() {
    window.clearTimeout(this.wheelNavigationTimer);
    this.wheelNavigationTimer = window.setTimeout(() => {
      this.wheelDeltaBuffer = 0;
    }, this.wheelNavigation.idleResetMs);
  }

  normalizeWheelDeltaY(event) {
    if (event.deltaMode === 1) {
      return event.deltaY * 16;
    }

    if (event.deltaMode === 2) {
      return event.deltaY * this.getViewportSize().height;
    }

    return event.deltaY;
  }

  handleTouchStart(event) {
    if (this.imageViewer.isOpen() || event.touches.length !== 1) {
      this.resetSwipeStart();
      return;
    }

    const touch = event.touches[0];
    this.swipeStart = {
      x: touch.clientX,
      y: touch.clientY,
      isVerticalSwipe: false,
    };
  }

  handleTouchMove(event) {
    if (!this.swipeStart || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const dx = touch.clientX - this.swipeStart.x;
    const dy = touch.clientY - this.swipeStart.y;
    const isVerticalIntent =
      Math.abs(dy) >= this.swipeNavigation.intentDistance &&
      Math.abs(dy) > Math.abs(dx) * this.swipeNavigation.dominanceRatio;

    if (this.swipeStart.isVerticalSwipe || isVerticalIntent) {
      this.swipeStart.isVerticalSwipe = true;
      event.preventDefault();
    }
  }

  handleTouchEnd(event) {
    if (!this.swipeStart || event.changedTouches.length === 0) {
      this.resetSwipeStart();
      return;
    }

    const touch = event.changedTouches[0];
    const dx = touch.clientX - this.swipeStart.x;
    const dy = touch.clientY - this.swipeStart.y;
    const isVerticalSwipe =
      this.swipeStart.isVerticalSwipe &&
      Math.abs(dy) >= this.swipeNavigation.minDistance &&
      Math.abs(dy) > Math.abs(dx) * this.swipeNavigation.dominanceRatio;

    if (isVerticalSwipe) {
      event.preventDefault();
      this.setActiveIndex(this.activeIndex + (dy < 0 ? 1 : -1));
    }

    this.resetSwipeStart();
  }

  resetSwipeStart() {
    this.swipeStart = null;
  }

  parseMarkdownTree(markdown) {
    const stack = [];
    let nextId = 0;
    let parsedRoot = null;

    markdown
      .split("\n")
      .filter((line) => line.trim())
      .forEach((line) => {
        const itemMatch = line.match(/^(\s*)-\s+(.+)$/);
        if (!itemMatch) {
          const continuationMatch = line.match(/^(\s+)(\S.*)$/);
          if (continuationMatch && stack.length > 0) {
            const indent = continuationMatch[1].replace(/\t/g, "    ").length;
            const continuationParent = this.findContinuationParent(stack, indent);
            const continuationText = continuationMatch[2].trim();

            if (continuationParent) {
              if (continuationText.startsWith("@image ")) {
                continuationParent.image = this.resolveImagePath(continuationText.slice("@image ".length).trim());
                return;
              }

              continuationParent.label = `${continuationParent.label}\n${continuationText}`;
            }
          }

          return;
        }

        const indent = itemMatch[1].replace(/\t/g, "    ").length;

        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        const depth = stack.length;
        const node = {
          id: `node-${nextId++}`,
          label: itemMatch[2].trim(),
          children: [],
          parent: null,
          depth,
          image: "",
          preorderIndex: 0,
        };

        if (depth === 0) {
          parsedRoot = node;
        } else {
          const parent = stack[depth - 1].node;
          node.parent = parent;
          parent.children.push(node);
        }

        stack.push({ node, indent });
      });

    return parsedRoot;
  }

  findContinuationParent(stack, indent) {
    for (let index = stack.length - 1; index >= 0; index -= 1) {
      if (stack[index].indent <= indent) {
        return stack[index].node;
      }
    }

    return stack[stack.length - 1]?.node ?? null;
  }

  assignTreeMetadata(treeRoot) {
    this.collectPreorder(treeRoot).forEach((node, index) => {
      node.preorderIndex = index;
    });
  }

  resolveImagePath(path) {
    if (/^(https?:|data:|\/|\.\/|\.\.\/)/.test(path)) {
      return path;
    }

    return `./project/${path}`;
  }

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  collectPreorder(node, list = []) {
    list.push(node);
    node.children.forEach((child) => this.collectPreorder(child, list));
    return list;
  }

  setActiveIndex(index) {
    this.activeIndex = Math.max(0, Math.min(index, this.preorder.length));
    this.cameraTargetIndex = null;
    this.render();
  }

  render() {
    if (!this.root || !this.nodeLayer) return;
    
    const activeNode = this.preorder[this.activeIndex] ?? null;
    this.currentNodeMetrics = this.measureAllNodes(this.preorder, activeNode);
    const model = activeNode ? this.buildVisibleModel(activeNode) : this.buildEndModel();
    const viewport = this.computeViewport(model, this.cameraTargetIndex);

    this.syncLinks(model.links);
    this.syncNodes(model.nodes, activeNode);
    this.positionMapLayer(viewport, model);
    this.updateControls();
  }

  measureAllNodes(nodes, activeNode) {
    const measurer = document.createElement("div");
    measurer.className = "node-measurer";
    document.body.appendChild(measurer);

    const metrics = new Map();
    nodes.forEach((node) => {
      const content = this.createNodeContent();
      this.updateNodeContent(content, node, node.id === activeNode?.id);
      measurer.appendChild(content.root);

      const rect = content.root.getBoundingClientRect();
      metrics.set(node.id, {
        width: Math.max(this.layout.minNodeWidth, Math.ceil(rect.width)),
        height: Math.max(this.layout.minNodeHeight, Math.ceil(rect.height)),
      });

      content.root.remove();
    });

    measurer.remove();
    return metrics;
  }

  buildEndModel() {
    const visibleIds = new Set(this.preorder.map((node) => node.id));
    const positions = new Map();
    const nodes = [];
    const links = [];
    const rootMetric = this.getNodeMetric(this.root);

    this.placeSubtree(this.root, visibleIds, positions, {
      x: this.layout.stagePaddingX + rootMetric.width / 2,
      y: this.layout.centerBaseline,
    });

    visibleIds.forEach((id) => {
      const node = this.idToNode.get(id);
      const position = positions.get(id);
      if (!position) {
        return;
      }

      nodes.push({
        id,
        label: node.label,
        x: position.x,
        y: position.y,
        width: this.getNodeMetric(node).width,
        height: this.getNodeMetric(node).height,
        depth: node.depth,
        preorderIndex: node.preorderIndex,
        isPath: false,
        isActive: false,
        isComplete: false,
      });

      if (node.parent && positions.has(node.parent.id)) {
        const parentMetric = this.getNodeMetric(node.parent);
        const nodeMetric = this.getNodeMetric(node);
        links.push({
          id: `${node.parent.id}->${node.id}`,
          from: positions.get(node.parent.id),
          fromWidth: parentMetric.width,
          to: position,
          toWidth: nodeMetric.width,
          isPathLink: false,
        });
      }
    });

    return { nodes, links, baseline: this.layout.centerBaseline, isEnd: true };
  }

  buildVisibleModel(activeNode) {
    const path = this.pathToRoot(activeNode);
    const pathIds = new Set(path.map((node) => node.id));
    const visibleIds = new Set(this.preorder.slice(0, this.activeIndex + 1).map((node) => node.id));
    const positions = new Map();
    const nodes = [];
    const links = [];
    const completedSubtrees = [];

    path.forEach((node, depthIndex) => {
      const completeChildren = node.children.filter(
        (child) => visibleIds.has(child.id) && !pathIds.has(child.id),
      );

      completeChildren.forEach((child) => {
        completedSubtrees.push({
          child,
          depthIndex,
          height: this.measureSubtree(child, visibleIds).height,
        });
      });
    });

    const completedHeight =
      completedSubtrees.reduce((total, subtree) => total + subtree.height, 0) +
      Math.max(0, completedSubtrees.length - 1) * this.layout.rowGap;
    const baseline = this.layout.centerBaseline;
    let pathCursorX = this.layout.stagePaddingX;

    path.forEach((node, index) => {
      const metric = this.getNodeMetric(node);
      positions.set(node.id, {
        x: pathCursorX + metric.width / 2,
        y: baseline,
      });
      pathCursorX += metric.width + this.layout.pathGap;
    });

    let cursorY = baseline - this.layout.rowGap - completedHeight;
    completedSubtrees.forEach((subtree) => {
      const parentPosition = positions.get(path[subtree.depthIndex].id);
      const parentMetric = this.getNodeMetric(path[subtree.depthIndex]);
      const childMetric = this.getNodeMetric(subtree.child);
      this.placeSubtree(subtree.child, visibleIds, positions, {
        x: parentPosition.x + parentMetric.width / 2 + this.layout.pathGap + childMetric.width / 2,
        y: cursorY + subtree.height / 2,
      });
      cursorY += subtree.height + this.layout.rowGap;
    });

    visibleIds.forEach((id) => {
      const node = this.idToNode.get(id);
      const position = positions.get(id);
      if (!position) {
        return;
      }

      const isPath = pathIds.has(id);
      nodes.push({
        id,
        label: node.label,
        x: position.x,
        y: position.y,
        width: this.getNodeMetric(node).width,
        height: this.getNodeMetric(node).height,
        depth: node.depth,
        preorderIndex: node.preorderIndex,
        isPath,
        isActive: node.id === activeNode.id,
        isComplete: !isPath,
      });

      if (node.parent && positions.has(node.parent.id)) {
        const parentMetric = this.getNodeMetric(node.parent);
        const nodeMetric = this.getNodeMetric(node);
        links.push({
          id: `${node.parent.id}->${node.id}`,
          from: positions.get(node.parent.id),
          fromWidth: parentMetric.width,
          to: position,
          toWidth: nodeMetric.width,
          isPathLink: pathIds.has(node.parent.id) && pathIds.has(node.id),
        });
      }
    });

    return { nodes, links, baseline };
  }

  pathToRoot(node) {
    const path = [];
    let current = node;

    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  measureSubtree(node, visibleIds) {
    const visibleChildren = node.children.filter((child) => visibleIds.has(child.id));
    const metric = this.getNodeMetric(node);
    if (visibleChildren.length === 0) {
      return { height: metric.height };
    }

    const childHeights = visibleChildren.map((child) => this.measureSubtree(child, visibleIds).height);
    return {
      height: Math.max(
        metric.height,
        childHeights.reduce((total, height) => total + height, 0) + (childHeights.length - 1) * this.layout.rowGap,
      ),
    };
  }

  placeSubtree(node, visibleIds, positions, anchor) {
    const visibleChildren = node.children.filter((child) => visibleIds.has(child.id));
    positions.set(node.id, { x: anchor.x, y: anchor.y });

    if (visibleChildren.length === 0) {
      return;
    }

    const childMeasures = visibleChildren.map((child) => ({
      child,
      height: this.measureSubtree(child, visibleIds).height,
    }));
    const totalHeight =
      childMeasures.reduce((total, item) => total + item.height, 0) + (childMeasures.length - 1) * this.layout.rowGap;

    let childCursor = anchor.y - totalHeight / 2;
    childMeasures.forEach(({ child, height }) => {
      const childY = childCursor + height / 2;
      const nodeMetric = this.getNodeMetric(node);
      const childMetric = this.getNodeMetric(child);
      this.placeSubtree(child, visibleIds, positions, {
        x: anchor.x + nodeMetric.width / 2 + this.layout.pathGap + childMetric.width / 2,
        y: childY,
      });
      childCursor += height + this.layout.rowGap;
    });
  }

  getNodeMetric(node) {
    return this.currentNodeMetrics.get(node.id) ?? {
      width: this.layout.minNodeWidth,
      height: this.layout.minNodeHeight,
    };
  }

  computeViewport(model, targetIndex = null) {
    const viewportSize = this.getViewportSize();
    const logicalViewport = {
      width: viewportSize.width / this.cameraZoom,
      height: viewportSize.height / this.cameraZoom,
    };
    if (model.nodes.length === 0) {
      return { x: 0, y: 0, width: logicalViewport.width, height: logicalViewport.height };
    }

    if (model.isEnd) {
      return this.computeEndViewport(model, logicalViewport, targetIndex);
    }

    const pathNodes = model.nodes.filter((node) => node.isPath);
    const pathMinX = Math.min(...pathNodes.map((node) => node.x - node.width / 2));
    const pathMaxX = Math.max(...pathNodes.map((node) => node.x + node.width / 2));
    const pathCenterX = (pathMinX + pathMaxX) / 2;
    const activeNode = model.nodes.find((node) => node.isActive);
    const targetNode =
      targetIndex === null ? activeNode : model.nodes.find((node) => node.preorderIndex === targetIndex) ?? activeNode;
    let viewportX = pathCenterX - logicalViewport.width / 2;
    let viewportY = model.baseline - logicalViewport.height / 2;

    if (targetNode) {
      viewportX = this.keepNodeInCenterBand(viewportX, logicalViewport.width, targetNode.x, this.layout.cameraTargetCenterBand);
      viewportY = this.keepNodeInCenterBand(viewportY, logicalViewport.height, targetNode.y, this.layout.cameraTargetCenterBand);
    }

    return {
      x: viewportX,
      y: viewportY,
      width: logicalViewport.width,
      height: logicalViewport.height,
    };
  }

  computeEndViewport(model, logicalViewport, targetIndex = null) {
    const bounds = this.computeModelBounds(model.nodes);
    const graphCenterX = (bounds.minX + bounds.maxX) / 2;
    const graphCenterY = (bounds.minY + bounds.maxY) / 2;
    const targetNode = model.nodes.find((node) => node.preorderIndex === targetIndex);
    let viewportX = graphCenterX - logicalViewport.width / 2;
    let viewportY = graphCenterY - logicalViewport.height / 2;

    if (targetNode) {
      viewportX = this.keepNodeInCenterBand(viewportX, logicalViewport.width, targetNode.x, this.layout.cameraTargetCenterBand);
      viewportY = this.keepNodeInCenterBand(viewportY, logicalViewport.height, targetNode.y, this.layout.cameraTargetCenterBand);
    }

    return {
      x: viewportX,
      y: viewportY,
      width: logicalViewport.width,
      height: logicalViewport.height,
    };
  }

  computeModelBounds(nodes) {
    return nodes.reduce(
      (bounds, node) => ({
        minX: Math.min(bounds.minX, node.x - node.width / 2),
        maxX: Math.max(bounds.maxX, node.x + node.width / 2),
        minY: Math.min(bounds.minY, node.y - node.height / 2),
        maxY: Math.max(bounds.maxY, node.y + node.height / 2),
      }),
      {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
      },
    );
  }

  keepNodeInCenterBand(viewportStart, viewportSize, nodeCenter, centerBandRatio) {
    const bandPadding = (viewportSize * (1 - centerBandRatio)) / 2;
    const bandStart = viewportStart + bandPadding;
    const bandEnd = viewportStart + viewportSize - bandPadding;

    if (nodeCenter < bandStart) {
      return nodeCenter - bandPadding;
    }

    if (nodeCenter > bandEnd) {
      return nodeCenter - viewportSize + bandPadding;
    }

    return viewportStart;
  }

  positionMapLayer(viewport, model) {
    const canvas = this.computeCanvasSize(model, viewport);

    this.mapLayer.style.width = `${canvas.width}px`;
    this.mapLayer.style.height = `${canvas.height}px`;
    this.linkLayer.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
    this.mapLayer.style.transform = `scale(${this.cameraZoom}) translate(${-viewport.x}px, ${-viewport.y}px)`;
  }

  computeCanvasSize(model, viewport) {
    const maxNodeRight = model.nodes.reduce((maxRight, node) => Math.max(maxRight, node.x + node.width / 2), 0);
    const maxNodeBottom = model.nodes.reduce((maxBottom, node) => Math.max(maxBottom, node.y + node.height / 2), 0);

    return {
      width: Math.max(viewport.x + viewport.width, maxNodeRight + this.layout.stagePaddingX),
      height: Math.max(viewport.y + viewport.height, maxNodeBottom + this.layout.stagePaddingY),
    };
  }

  getViewportSize() {
    return {
      width: Math.max(1, this.mindmap.clientWidth),
      height: Math.max(1, this.mindmap.clientHeight),
    };
  }

  syncNodes(nodes, activeNode) {
    const liveIds = new Set(nodes.map((node) => node.id));

    this.renderedNodes.forEach((entry, id) => {
      if (!liveIds.has(id)) {
        entry.group.classList.add("leaving");
        window.clearTimeout(entry.removalTimer);
        entry.removalTimer = window.setTimeout(() => {
          entry.group.remove();
          this.renderedNodes.delete(id);
        }, 220);
        return;
      }

      if (entry.removalTimer) {
        window.clearTimeout(entry.removalTimer);
        entry.removalTimer = null;
        entry.group.classList.remove("leaving");
      }
    });

    nodes
      .sort((a, b) => a.preorderIndex - b.preorderIndex)
      .forEach((node) => {
        let entry = this.renderedNodes.get(node.id);
        if (!entry) {
          entry = this.createNodeElement(node);
          this.renderedNodes.set(node.id, entry);
          this.nodeLayer.appendChild(entry.group);
        }

        entry.group.classList.toggle("active", node.isActive);
        entry.group.classList.toggle("path-node", node.isPath);
        entry.group.classList.toggle("complete-node", node.isComplete);
        entry.group.classList.toggle("camera-target", node.preorderIndex === this.cameraTargetIndex);
        entry.group.dataset.nodeId = node.id;
        if (activeNode && node.id === activeNode.id) {
          entry.group.setAttribute("aria-current", "true");
        } else {
          entry.group.removeAttribute("aria-current");
        }
        entry.group.setAttribute("aria-label", `查看 ${this.formatInlineLabel(node.label)} 的视角`);
        entry.group.style.width = `${node.width}px`;
        entry.group.style.height = `${node.height}px`;
        entry.group.style.transform = `translate(${node.x - node.width / 2}px, ${node.y - node.height / 2}px)`;
        this.updateNodeContent(entry.content, this.idToNode.get(node.id), node.isActive);
      });
  }

  createNodeElement(node) {
    const group = document.createElement("div");
    group.classList.add("mind-node", "entering");
    group.setAttribute("role", "button");
    group.setAttribute("tabindex", "0");
    group.addEventListener("click", () => {
      this.focusCameraOnNode(node.id);
      this.onNodeClick(node.id);
    });
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.focusCameraOnNode(node.id);
        this.onNodeClick(node.id);
      }
    });

    const content = this.createNodeContent();
    this.updateNodeContent(content, node, node.preorderIndex === this.activeIndex);
    group.append(content.root);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => group.classList.remove("entering"));
    });

    return { group, content, removalTimer: null };
  }

  focusCameraOnNode(nodeId) {
    const node = this.idToNode.get(nodeId);
    if (!node) {
      return;
    }

    // 更新activeIndex到选中的节点
    this.activeIndex = node.preorderIndex;
    this.cameraTargetIndex = null;
    this.render();
  }

  createNodeContent() {
    const content = document.createElement("div");
    content.classList.add("node-content");

    const subtitle = document.createElement("span");
    subtitle.classList.add("node-subtitle");

    const title = document.createElement("span");
    title.classList.add("node-title");

    const imageWrap = document.createElement("button");
    imageWrap.type = "button";
    imageWrap.classList.add("node-image");
    imageWrap.addEventListener("click", (event) => {
      event.stopPropagation();
      const src = imageWrap.dataset.previewSrc;
      if (src) {
        this.imageViewer.open(src, imageWrap.dataset.previewAlt || "节点插图");
      }
    });
    imageWrap.addEventListener("keydown", (event) => {
      event.stopPropagation();
    });

    const image = document.createElement("img");
    imageWrap.appendChild(image);
    content.append(subtitle, title, imageWrap);

    return { root: content, subtitle, title, imageWrap, image };
  }

  updateNodeContent(content, node, isActive) {
    const [subtitle, ...titleLines] = node.label.split("\n");
    const title = titleLines.length > 0 ? titleLines.join(" / ") : subtitle;

    content.root.classList.toggle("has-subtitle", titleLines.length > 0);
    content.root.classList.toggle("has-node-image", Boolean(node.image));
    content.root.classList.toggle("image-expanded", Boolean(node.image) && isActive);
    content.subtitle.textContent = subtitle;
    content.title.textContent = title;

    if (node.image) {
      if (content.image.getAttribute("src") !== node.image) {
        content.image.src = node.image;
      }

      content.image.alt = `${this.formatInlineLabel(node.label)} 插图`;
      content.imageWrap.disabled = false;
      content.imageWrap.dataset.previewSrc = node.image;
      content.imageWrap.dataset.previewAlt = content.image.alt;
      content.imageWrap.setAttribute("aria-label", `放大查看 ${content.image.alt}`);
    } else {
      content.image.removeAttribute("src");
      content.image.alt = "";
      content.imageWrap.disabled = true;
      delete content.imageWrap.dataset.previewSrc;
      delete content.imageWrap.dataset.previewAlt;
      content.imageWrap.removeAttribute("aria-label");
    }
  }

  syncLinks(links) {
    const liveIds = new Set(links.map((link) => link.id));

    this.renderedLinks.forEach((entry, id) => {
      if (!liveIds.has(id)) {
        entry.path.classList.add("leaving");
        window.clearTimeout(entry.removalTimer);
        entry.removalTimer = window.setTimeout(() => {
          entry.path.remove();
          this.renderedLinks.delete(id);
        }, 220);
        return;
      }

      if (entry.removalTimer) {
        window.clearTimeout(entry.removalTimer);
        entry.removalTimer = null;
        entry.path.classList.remove("leaving");
      }
    });

    links.forEach((link) => {
      let entry = this.renderedLinks.get(link.id);
      if (!entry) {
        const path = document.createElementNS(this.SVG_NS, "path");
        path.classList.add("mind-link", "entering");
        path.setAttribute("pathLength", "1");
        entry = { path, removalTimer: null };
        this.renderedLinks.set(link.id, entry);
        this.linkLayer.appendChild(path);
        window.setTimeout(() => path.classList.remove("entering"), 980);
      }

      entry.path.classList.toggle("path-link", link.isPathLink);
      entry.path.setAttribute("d", this.linkPath(link));
    });
  }

  linkPath(link) {
    const startX = link.from.x + link.fromWidth / 2;
    const startY = link.from.y;
    const endX = link.to.x - link.toWidth / 2;
    const endY = link.to.y;
    const midX = startX + Math.max(36, (endX - startX) * 0.5);

    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  }

  updateControls() {
    const activeNode = this.preorder[this.activeIndex];
    const nextNode = this.preorder[this.activeIndex + 1];
    const endIndex = this.preorder.length;
    const isEnd = this.activeIndex === endIndex;
    const sliderProgress = endIndex === 0 ? 0 : (this.activeIndex / endIndex) * 100;
    const label = this.getNextStepLabel(nextNode, isEnd);

    if (this.counter) {
      this.counter.textContent = `${this.activeIndex + 1} / ${endIndex + 1}`;
    }
    if (this.nodeSlider) {
      this.nodeSlider.value = String(this.activeIndex);
      this.nodeSlider.style.setProperty("--slider-progress", `${sliderProgress}%`);
    }
    if (this.zoomSlider) {
      this.zoomSlider.value = String(Math.round(this.cameraZoom * 100));
    }
    if (this.zoomValue) {
      this.zoomValue.textContent = `${Math.round(this.cameraZoom * 100)}%`;
    }
    if (this.activeScaleSlider) {
      this.activeScaleSlider.value = String(Math.round(this.activeScale * 100));
    }
    if (this.activeScaleValue) {
      this.activeScaleValue.textContent = `${this.activeScale.toFixed(2)}x`;
    }
    if (this.nodeLayer) {
      this.nodeLayer.style.setProperty("--active-node-scale", this.activeScale.toFixed(2));
    }
    if (this.nextNodePreview) {
      this.nextNodePreview.classList.toggle("has-subtitle", label.hasSubtitle);
    }
    if (this.nextNodeSubtitle) {
      this.nextNodeSubtitle.textContent = label.subtitle;
    }
    if (this.nextNodeTitle) {
      this.nextNodeTitle.textContent = label.title;
    }
  }

  getNextStepLabel(nextNode, isEnd) {
    if (isEnd) {
      return {
        hasSubtitle: true,
        subtitle: "当前",
        title: "结束总览",
      };
    }

    if (nextNode) {
      return this.splitLabel(nextNode.label);
    }

    return {
      hasSubtitle: true,
      subtitle: "下一步",
      title: "结束总览",
    };
  }

  updateDeckHeading(label) {
    const heading = this.splitLabel(label);

    if (this.deckSubtitle) {
      this.deckSubtitle.textContent = heading.subtitle;
    }
    if (this.deckTitle) {
      this.deckTitle.textContent = heading.title;
    }
  }

  formatInlineLabel(label) {
    return label.replace(/\s*\n\s*/g, " / ");
  }

  splitLabel(label) {
    const [subtitle, ...titleLines] = label.split("\n");
    const hasSubtitle = titleLines.length > 0;

    return {
      hasSubtitle,
      subtitle,
      title: hasSubtitle ? titleLines.join("\n") : subtitle,
    };
  }

  loadMarkdown(markdown) {
    this.root = this.parseMarkdownTree(markdown);
    this.assignTreeMetadata(this.root);
    this.preorder = this.collectPreorder(this.root);
    this.idToNode = new Map(this.preorder.map((node) => [node.id, node]));
    this.activeIndex = 0;
    
    if (this.nodeSlider) {
      this.nodeSlider.max = String(this.preorder.length);
    }
    
    this.updateDeckHeading(this.root.label);
    this.render();
  }
}
