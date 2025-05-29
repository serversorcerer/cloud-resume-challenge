variable "function_name" {
  description = "Name of the Lambda function"
  type        = string
  default     = "terminal-commands"
}

variable "source_file" {
  description = "Path to commands.js file"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs18.x"
}

variable "memory_size" {
  description = "Lambda memory size"
  type        = number
  default     = 128
}

variable "timeout" {
  description = "Lambda timeout"
  type        = number
  default     = 5
}
