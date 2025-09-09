'use client'
import { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Collapse,
  IconButton,
  Avatar,
  LinearProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Assignment as ProjectIcon,
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon
} from '@mui/icons-material'

interface Project {
  id: string
  name: string
  description?: string
  imageUrl?: string
  imageKey?: string
  owner: {
    email: string
    name?: string
  }
  tasks: Array<{
    id: string
    title: string
    status: 'PENDING' | 'DONE'
  }>
  createdAt: string
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  
  // Task creation state
  const [taskInputs, setTaskInputs] = useState<{[key: string]: string}>({})
  const [taskLoading, setTaskLoading] = useState<{[key: string]: boolean}>({})
  const [expandedProjects, setExpandedProjects] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      setError('Failed to fetch projects')
    }
  }

  async function createProject() {
    if (!name.trim() || !email.trim()) {
      setError('Please fill in both project name and owner email')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Upload image first if selected
      let imageData = {}
      if (selectedFile) {
        imageData = await uploadImage()
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          ownerEmail: email,
          description: description.trim() || undefined,
          ...imageData
        }),
      })
      
      if (response.ok) {
        const newProject = await response.json()
        setProjects(prev => [newProject, ...prev])
        setName('')
        setEmail('')
        setDescription('')
        setSelectedFile(null)
        setImagePreview(null)
        setSuccess('Project created successfully!')
      } else {
        const errorData = await response.json()
        setError(`Failed to create project: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      setError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  async function createTask(projectId: string) {
    const taskTitle = taskInputs[projectId]?.trim()
    if (!taskTitle) {
      setError('Please enter a task title')
      return
    }

    setTaskLoading(prev => ({ ...prev, [projectId]: true }))
    setError('')
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle, projectId }),
      })
      
      if (response.ok) {
        const newTask = await response.json()
        // Update the projects state to include the new task
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? { ...project, tasks: [...project.tasks, newTask] }
            : project
        ))
        // Clear the input
        setTaskInputs(prev => ({ ...prev, [projectId]: '' }))
        setSuccess('Task created successfully!')
      } else {
        const errorData = await response.json()
        setError(`Failed to create task: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error creating task:', error)
      setError('Failed to create task')
    } finally {
      setTaskLoading(prev => ({ ...prev, [projectId]: false }))
    }
  }

  function toggleProjectExpansion(projectId: string) {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function uploadImage(): Promise<{url?: string, key?: string}> {
    if (!selectedFile) return {}

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadProgress(100)
      return { url: result.url, key: result.key }
    } catch (error) {
      throw error
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Container maxWidth="lg" className="py-8">
      {/* Header */}
      <Box className="mb-8">
        <Typography variant="h3" component="h1" className="mb-2" gutterBottom>
          Project Management
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Create and manage your projects with ease
        </Typography>
      </Box>

      {/* Create Project Form */}
      <Card className="mb-8">
        <CardContent>
          <Typography variant="h5" className="mb-4" gutterBottom>
            Create New Project
          </Typography>
          
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" className="mb-4">
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || uploading}
                placeholder="Enter project name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Owner Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || uploading}
                placeholder="Enter owner email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || uploading}
                placeholder="Enter project description"
              />
            </Grid>
            <Grid item xs={12}>
              <Box className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={loading || uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Box className="cursor-pointer">
                    {imagePreview ? (
                      <Box>
                        <Avatar
                          src={imagePreview}
                          sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {selectedFile?.name}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedFile(null)
                            setImagePreview(null)
                          }}
                          disabled={loading || uploading}
                        >
                          Remove
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Upload Project Image
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click to select an image (max 5MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </label>
              </Box>
            </Grid>
            {uploading && (
              <Grid item xs={12}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Uploading image... {uploadProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                onClick={createProject}
                disabled={loading || uploading}
                startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Box>
        <Typography variant="h5" className="mb-4" gutterBottom>
          Your Projects
        </Typography>
        
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ProjectIcon className="text-6xl text-gray-400 mb-4" />
              <Typography variant="h6" color="text.secondary">
                No projects yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first project above to get started!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} md={6} lg={4} key={project.id}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent>
                    {/* Project Image */}
                    {project.imageUrl && (
                      <Box className="mb-4">
                        <Avatar
                          src={project.imageUrl}
                          sx={{ width: '100%', height: 200, borderRadius: 2 }}
                          variant="rounded"
                        />
                      </Box>
                    )}
                    
                    <Box className="flex justify-between items-start mb-3">
                      <Typography variant="h6" component="h3" className="font-semibold">
                        {project.name}
                      </Typography>
                      <Box className="flex items-center gap-2">
                        <Chip 
                          label={`${project.tasks.length} tasks`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <IconButton
                          size="small"
                          onClick={() => toggleProjectExpansion(project.id)}
                        >
                          {expandedProjects[project.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {/* Project Description */}
                    {project.description && (
                      <Typography variant="body2" color="text.secondary" className="mb-2">
                        {project.description}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" className="mb-2">
                      Owner: {project.owner?.email ?? '—'}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </Typography>

                    {/* Collapsible Task Section */}
                    <Collapse in={expandedProjects[project.id]}>
                      <Divider className="my-3" />
                      
                      {/* Add Task Form */}
                      <Box className="mb-3">
                        <Typography variant="subtitle2" className="mb-2">
                          Add New Task:
                        </Typography>
                        <Box className="flex gap-2">
                          <TextField
                            size="small"
                            fullWidth
                            placeholder="Enter task title"
                            value={taskInputs[project.id] || ''}
                            onChange={(e) => setTaskInputs(prev => ({
                              ...prev,
                              [project.id]: e.target.value
                            }))}
                            disabled={taskLoading[project.id]}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                createTask(project.id)
                              }
                            }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => createTask(project.id)}
                            disabled={taskLoading[project.id] || !taskInputs[project.id]?.trim()}
                            startIcon={taskLoading[project.id] ? <CircularProgress size={16} /> : <AddIcon />}
                          >
                            {taskLoading[project.id] ? '' : 'Add'}
                          </Button>
                        </Box>
                      </Box>

                      {/* Tasks List */}
                      {project.tasks.length > 0 && (
                        <>
                          <Typography variant="subtitle2" className="mb-2">
                            Tasks ({project.tasks.length}):
                          </Typography>
                          <List dense>
                            {project.tasks.map((task) => (
                              <ListItem key={task.id} className="px-0">
                                <ListItemIcon className="min-w-0 mr-2">
                                  {task.status === 'DONE' ? (
                                    <DoneIcon className="text-green-500" fontSize="small" />
                                  ) : (
                                    <PendingIcon className="text-yellow-500" fontSize="small" />
                                  )}
                                </ListItemIcon>
                                <ListItemText 
                                  primary={task.title}
                                  className={task.status === 'DONE' ? 'line-through opacity-60' : ''}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  )
}
