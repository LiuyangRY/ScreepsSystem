// 顶点类
export class Vertex {
    id: number | undefined;
    value?: any;
    edges: Edge[];
    neighbors: Vertex[];
    data: { [property: string]: any };

    constructor(value?: any) {
        this.value = value;
        this.edges = [];
        this.neighbors = [];
        this.data = {};
    }
    
    // 相邻顶点
    AdjacentTo(vertex: Vertex) {
        return this.neighbors.includes(vertex);
    }
}

// 边
export class Edge {
    vertices: [Vertex, Vertex];
    weight: number;
    directional?: boolean;
    
    constructor(vertex1: Vertex, vertex2: Vertex, weight?: number, directional?: boolean) {
        this.vertices = [vertex1, vertex2];
        this.weight = weight ? weight : 1;
        this.directional = directional ? directional : false;
    }
}

// 图
export class Graph {
    vertices: Vertex[];
    edges: Edge[];
    directed: boolean;
    simple: boolean;
    connected: boolean;

    private counter: number;

    constructor(initializer: {
        V?: Vertex[],
        E?: Edge[],
        directed?: boolean,
        simple?: boolean,
        connected?: boolean
    } = {}) {
        _.defaults(initializer, {
            V           : [],
            E           : [],
            directed    : false,
            simple      : true,
            connected   : false
        });
        this.vertices = initializer.V!;
        this.edges = initializer.E!;
        this.directed = initializer.directed!;
        this.simple = initializer.directed!;
        this.connected = initializer.connected!;
        this.counter = 0;
    }

    // 添加顶点
    AddVertex(vertex: Vertex) {
        this.vertices.push(vertex);
        vertex.id = this.counter;
        this.counter++;
    }

    // 移除顶点
    RemoveVertex(vertex: Vertex) {
        // 从顶点的所有相邻顶点删除该顶点
        for(const neighbor of vertex.neighbors) {
            _.remove(neighbor.neighbors, vertex);
        }
        // 将接触到该顶点的所有边删除
        _.remove(this.edges, edge => _.includes(edge.vertices, vertex));
        // 从顶点列表删除顶点
        _.remove(this.vertices, vertex);
    }

    // 添加边
    AddEdge(edge: Edge) {
        const [vertex1, vertex2] = edge.vertices;
        if(this.simple) {
            if(vertex1.neighbors.includes(vertex2) || vertex2.neighbors.includes(vertex1)) {
                throw new Error(`${vertex1.id} 和 ${vertex2.id} 已经相邻，图形不是简单图形。`);
            }
        }
        vertex1.neighbors.push(vertex2);
        vertex1.edges.push(edge);
        if(!edge.directional) {
            vertex2.neighbors.push(vertex1);
            vertex2.edges.push(edge);
        }
        this.edges.push(edge);
    }

    // 删除边
    RemoveEdge(edge: Edge) {
        // 删除连接到该边的相邻边
        const [vertex1, vertex2] = edge.vertices;
        _.remove(vertex1.neighbors, vertex2);
        if(!edge.directional) {
            _.remove(vertex2.neighbors, vertex1);
        }
        _.remove(vertex1.edges, edge);
        _.remove(vertex2.edges, edge);
        _.remove(this.edges, edge);
    }

    // 连接边
    Connect(vertex1: Vertex, vertex2: Vertex, weight?: number, directional?: boolean) {
        const edge = new Edge(vertex1, vertex2, weight, directional);
        this.AddEdge(edge);
    }

    // 断开边的连接
    Disconnect(vertex1: Vertex, vertex2: Vertex) {
        let edge = _.find(vertex1.edges, edge => _.includes(edge.vertices, vertex2));
        if(!edge) {
            edge = _.find(vertex2.edges, edge => _.includes(edge.vertices, vertex1));
        }
        if(!edge) {
            throw new Error(`未发现顶点${vertex1.id} 和 ${vertex2.id}!`);
        } else {
            this.RemoveEdge(edge);
        }
    }
}

// 完全图
export class CompleteGraph extends Graph {
    constructor(V: Vertex[]) {
        super({ V: V, simple: true, connected: true });
        for(const v1 of this.vertices) {
            for(const v2 of this.vertices) {
                if(v1 != v2 && !v1.AdjacentTo(v2)) {
                    this.Connect(v1, v2);
                }
            }
        }
    }
}