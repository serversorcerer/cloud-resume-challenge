variable "function_name" {
  type        = string
  description = "Name of the Lambda function"
  default     = "terminal-commands"
}

variable "runtime" {
  type        = string
  description = "Lambda runtime"
  default     = "nodejs18.x"
}

variable "source_path" {
  type        = string
  description = "Path to command handler JS file"
  default     = "../../lambda/commands.js"
}

variable "memory_size" {
  type        = number
  default     = 128
}

variable "timeout" {
  type        = number
  default     = 5
}

variable "function_name" {
  description = "Lambda function name"
  type        = string
}

variable "lambda_source_path" {
  description = "Path to Lambda source file"
  type        = string
}
