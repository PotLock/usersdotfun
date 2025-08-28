// import { useLiveQuery, eq } from '@tanstack/react-db';
// import { workflowsCollection, queueJobsCollection, queueStatusCollection } from './collections';

// // Example 1: Basic workflow listing with live filtering
// export function WorkflowsList() {
//   // Live query that automatically updates when workflows change
//   const { data: activeWorkflows } = useLiveQuery((q) =>
//     q.from({ workflow: workflowsCollection })
//      .where(({ workflow }) => eq(workflow.status, 'ACTIVE'))
//      .orderBy(({ workflow }) => workflow.createdAt, 'desc')
//   );

//   const toggleWorkflow = (workflowId: string) => {
//     // Optimistic mutation - UI updates instantly
//     workflowsCollection.update(workflowId, (draft) => {
//       draft.status = draft.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
//     });
//   };

//   return (
//     <div>
//       <h2>Active Workflows ({activeWorkflows?.length || 0})</h2>
//       {activeWorkflows?.map((workflow) => (
//         <div key={workflow.id} className="border p-4 rounded">
//           <h3>{workflow.name}</h3>
//           <p>Status: {workflow.status}</p>
//           <p>Created by: {workflow.user.name}</p>
//           <button onClick={() => toggleWorkflow(workflow.id)}>
//             {workflow.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }

// // Example 2: Queue monitoring with live updates
// export function QueueMonitor() {
//   // Live query for queue status
//   const { data: queueStatuses } = useLiveQuery((q) =>
//     q.from({ queue: queueStatusCollection })
//      .orderBy(({ queue }) => queue.name, 'asc')
//   );

//   // Live query for recent failed jobs
//   const { data: failedJobs } = useLiveQuery((q) =>
//     q.from({ job: queueJobsCollection })
//      .where(({ job }) => eq(job.status, 'failed'))
//      .orderBy(({ job }) => job.timestamp, 'desc')
//   );

//   const toggleQueuePause = (queueName: string, isPaused: boolean) => {
//     // Optimistic mutation
//     queueStatusCollection.update(queueName, (draft) => {
//       draft.paused = !isPaused;
//     });
//   };

//   const deleteFailedJob = (jobId: string) => {
//     // Optimistic deletion
//     queueJobsCollection.delete(jobId);
//   };

//   return (
//     <div className="grid grid-cols-2 gap-6">
//       <div>
//         <h2>Queue Status</h2>
//         {queueStatuses?.map((queue) => (
//           <div key={queue.name} className="border p-4 rounded mb-2">
//             <h3>{queue.name}</h3>
//             <div className="grid grid-cols-2 gap-2 text-sm">
//               <span>Waiting: {queue.waiting}</span>
//               <span>Active: {queue.active}</span>
//               <span>Completed: {queue.completed}</span>
//               <span>Failed: {queue.failed}</span>
//             </div>
//             <button 
//               onClick={() => toggleQueuePause(queue.name, queue.paused)}
//               className={`mt-2 px-3 py-1 rounded ${
//                 queue.paused ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
//               }`}
//             >
//               {queue.paused ? 'Resume' : 'Pause'}
//             </button>
//           </div>
//         ))}
//       </div>

//       <div>
//         <h2>Failed Jobs ({failedJobs?.length || 0})</h2>
//         {failedJobs?.slice(0, 10).map((job) => (
//           <div key={job.id} className="border p-3 rounded mb-2">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h4 className="font-mono text-sm">{job.name}</h4>
//                 <p className="text-xs text-gray-600">
//                   {new Date(job.timestamp).toLocaleString()}
//                 </p>
//                 <p className="text-xs">Attempts: {job.attemptsMade}</p>
//               </div>
//               <button 
//                 onClick={() => deleteFailedJob(job.id)}
//                 className="text-red-500 hover:text-red-700 text-sm"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // Example 3: Advanced filtering and transformations
// export function WorkflowAnalytics() {
//   // Transform data with live queries
//   const { data: workflowStats } = useLiveQuery((q) =>
//     q.from({ workflow: workflowsCollection })
//      .select(({ workflow }) => {
//        const total = workflow.length;
//        const active = workflow.filter(w => w.status === 'ACTIVE').length;
//        const inactive = workflow.filter(w => w.status === 'INACTIVE').length;
//        const recentlyCreated = workflow.filter(w => 
//          new Date(w.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
//        ).length;
       
//        return {
//          total,
//          active,
//          inactive,
//          recentlyCreated,
//          activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
//        };
//      })
//   );

//   // Recent workflows with user info
//   const { data: recentWorkflows } = useLiveQuery((q) =>
//     q.from({ workflow: workflowsCollection })
//      .orderBy(({ workflow }) => workflow.createdAt, 'desc')
//      .select(({ workflow }) => 
//        workflow.slice(0, 5).map(w => ({
//          id: w.id,
//          name: w.name,
//          status: w.status,
//          createdBy: w.user.name,
//          createdAt: w.createdAt,
//          hasSchedule: !!w.schedule
//        }))
//      )
//   );

//   return (
//     <div className="space-y-6">
//       <div className="grid grid-cols-4 gap-4">
//         <div className="bg-blue-100 p-4 rounded">
//           <h3 className="font-semibold">Total Workflows</h3>
//           <p className="text-2xl font-bold">{workflowStats?.total || 0}</p>
//         </div>
//         <div className="bg-green-100 p-4 rounded">
//           <h3 className="font-semibold">Active</h3>
//           <p className="text-2xl font-bold">{workflowStats?.active || 0}</p>
//         </div>
//         <div className="bg-yellow-100 p-4 rounded">
//           <h3 className="font-semibold">Inactive</h3>
//           <p className="text-2xl font-bold">{workflowStats?.inactive || 0}</p>
//         </div>
//         <div className="bg-purple-100 p-4 rounded">
//           <h3 className="font-semibold">Recent (7d)</h3>
//           <p className="text-2xl font-bold">{workflowStats?.recentlyCreated || 0}</p>
//         </div>
//       </div>

//       <div>
//         <h2>Recent Workflows</h2>
//         <div className="space-y-2">
//           {recentWorkflows?.map((workflow) => (
//             <div key={workflow.id} className="border p-3 rounded flex justify-between">
//               <div>
//                 <h3 className="font-medium">{workflow.name}</h3>
//                 <p className="text-sm text-gray-600">
//                   Created by {workflow.createdBy} • {new Date(workflow.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className={`px-2 py-1 rounded text-xs ${
//                   workflow.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                 }`}>
//                   {workflow.status}
//                 </span>
//                 {workflow.hasSchedule && (
//                   <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
//                     Scheduled
//                   </span>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Example 4: Creating new workflows with optimistic updates
// export function CreateWorkflowForm() {
//   const handleCreateWorkflow = (workflowData: {
//     name: string;
//     source: any;
//     pipeline: any;
//   }) => {
//     // Optimistic insertion - appears in UI immediately
//     workflowsCollection.insert({
//       id: crypto.randomUUID(), // Temporary ID
//       name: workflowData.name,
//       status: 'INACTIVE',
//       source: workflowData.source,
//       pipeline: workflowData.pipeline,
//       createdAt: new Date(),
//       createdBy: 'current-user-id', // Replace with actual user ID
//       user: {
//         id: 'current-user-id',
//         name: 'Current User',
//         image: null
//       }
//     });
//   };

//   return (
//     <div>
//       <h2>Create New Workflow</h2>
//       <p>This would contain your workflow creation form...</p>
//       <button 
//         onClick={() => handleCreateWorkflow({
//           name: 'Test Workflow',
//           source: { pluginId: 'test', config: {}, search: {} },
//           pipeline: { steps: [] }
//         })}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         Create Test Workflow
//       </button>
//     </div>
//   );
