import axios from "axios";
import React, { useEffect, useState } from "react";
import { GraphCanvas, GraphNode, InternalGraphNode } from "reagraph";
import { getFolderByUserAddress } from "src/lib/CallData";
import { ConversationAPI } from "src/objects/conversation/api";
interface NodeType extends GraphNode {
  id: string;
  label: string; 
  content?: string;
  nodeType?: 'parent' | 'post';
  posts?: Array<{
    id: string | number;
    content: string;
  }>;
  blobId: string | null;
  certifiedEpoch?: number | null;
  chunkSize?: number | null;
  createdAt?: string | null;
  data: { msg?: string | null; success?: boolean | null } | null;
  encryptedAesKey: string | null;
  erasureCodeType: string | null;
  expiresAt: string | null;
  mimeType: string | null;
  name: string | null;
  numberOfChunks: number | null;
  owner: string | null;
  parentId: string | null;
  partition: string | null;
  ref: string | null;
  sizeBlob: number | null;
  status: string | null;
  storedEpoch: number | null;
  updatedAt: string | null;
  uploadId: string | null;
  vaultId: string | null;
}

interface EdgeType {
  id: string;
  source: string;
  target: string;
  label: string;
}

// Định nghĩa interface cho data từ API
interface ApiItem {
  parentId: string;
  content: string;
  posts: Array<{
    id: number | string;
    content: string;
  }>;
}

export default function GraphPage() {
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
  const [nodes, setNodes] = useState<NodeType[]>([]);
  const [edges, setEdges] = useState<EdgeType[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log("Selected Node:", selectedNode);
  }, [selectedNode]);

  useEffect(() => {
    console.log("Fetching data...");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `${import.meta.env.VITE_API_SERVER_URL}/data`;
      const response = await axios.get(url);
      
      if (!response.data) return;

      const res: ApiItem[] = response.data;
      
      const fetchedNodes: NodeType[] = [];
      
      // Tạo nodes cho categories với label là parentId
      const categories = [...new Set(res.map(item => item.parentId))];
      categories.forEach(category => {
        const categoryContent = res.find(item => item.parentId === category)?.content || '';
        fetchedNodes.push({
          id: category,
          label: category, // ParentId làm label
          nodeType: 'parent',
          content: categoryContent,
          blobId: null,
          data: null,
          encryptedAesKey: null,
          erasureCodeType: null,
          expiresAt: null,
          mimeType: null,
          name: null,
          numberOfChunks: null,
          owner: null,
          parentId: null,
          partition: null,
          ref: null,
          sizeBlob: null,
          status: null,
          storedEpoch: null,
          updatedAt: null,
          uploadId: null,
          vaultId: null
        });
      });

      // Tạo nodes cho posts với id trong content
      res.forEach(item => {
        item.posts.forEach(post => {
          fetchedNodes.push({
            id: `post-${post.id}`,
            label: `#${post.id}: ${post.content.substring(0, 30)}...`, // Thêm id vào label
            content: post.content,
            nodeType: 'post',
            blobId: null,
            data: null,
            parentId: item.parentId,
            encryptedAesKey: null,
            erasureCodeType: null,
            expiresAt: null,
            mimeType: null,
            name: null,
            numberOfChunks: null,
            owner: null,
            partition: null,
            ref: null,
            sizeBlob: null,
            status: null,
            storedEpoch: null,
            updatedAt: null,
            uploadId: null,
            vaultId: null
          });
        });
      });

      // Tạo edges trực tiếp từ parentId đến posts
      const fetchedEdges: EdgeType[] = [];
      
      res.forEach(item => {
        item.posts.forEach(post => {
          fetchedEdges.push({
            id: `edge-${fetchedEdges.length}`,
            source: item.parentId,
            target: `post-${post.id}`,
            label: "has_post"
          });
        });
      });

      setNodes(fetchedNodes);
      setEdges(fetchedEdges);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node: InternalGraphNode) => {
    const selectedNodeData: NodeType = {
      ...node,
      blobId: null,
      data: null,
      encryptedAesKey: null,
      erasureCodeType: null,
      expiresAt: null,
      mimeType: null,
      name: null,
      numberOfChunks: null,
      owner: null,
      parentId: null,
      partition: null,
      ref: null,
      sizeBlob: null,
      status: null,
      storedEpoch: null,
      updatedAt: null,
      uploadId: null,
      vaultId: null
    };
    setSelectedNode(selectedNodeData);
  };

  return (
    <div className="flex w-full h-[600px] gap-4">
      {/* Graph Column */}
      <div className="flex-1 border rounded-lg shadow-sm relative">
        {loading ? (
          <span>Loading...</span>
        ) : (
          <GraphCanvas
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            labelType="all"
            draggable={true}
          />
        )}
      </div>

      {/* Information Column */}
      <div className="flex-1 border rounded-lg shadow-sm p-4 z-10 overflow-y-scroll">
        {selectedNode ? (
          <div>
            <h2 className="text-xl font-bold mb-4">
              {selectedNode.nodeType === 'parent' ? (
                <>Category: {selectedNode.label}</>
              ) : (
                <>Post {selectedNode.id.replace('post-', '#')}</>
              )}
            </h2>

            {selectedNode.nodeType === 'parent' ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Category Content</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNode.content}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Related Posts</h3>
                  <div className="space-y-2">
                    {nodes
                      .filter(node => node.parentId === selectedNode.id)
                      .map(post => (
                        <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              {post.id.replace('post-', '#')}
                            </span>
                          </div>
                          <p className="text-gray-700">{post.content}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500">Parent Category:</span>
                  <span className="ml-2 text-gray-700">{selectedNode.parentId}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Post Content</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNode.content}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-lg">No node selected</p>
            <p className="text-sm mt-2">Click on a node to view its details</p>
          </div>
        )}
      </div>
    </div>
  );
}
interface InfoFieldProps {
  label: string;
  value: string | number | undefined;
  isTimestamp?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, isTimestamp }) => {
  const displayValue = isTimestamp ? formatTimestamp(value) : value;

  return (
    <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200">
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className="text-gray-800 break-all">
        {isTimestamp ? (
          <span className="flex flex-col">
            <span className="text-base">{displayValue}</span>
            <span className="text-xs text-gray-500 mt-1">
              Timestamp: {value}
            </span>
          </span>
        ) : (
          displayValue || (
            <span className="text-gray-400 italic">Not available</span>
          )
        )}
      </p>
    </div>
  );
};

const formatTimestamp = (timestamp: number | string | undefined): string => {
    if (!timestamp) return 'Not available';
    
    const date = new Date(Number(timestamp));
    
    // Format: "Feb 14, 2024, 10:30 AM (GMT+7)"
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'shortOffset'
    }).format(date);
  };
  
