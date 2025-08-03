import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Type, 
  AlignLeft, 
  ChevronDown, 
  Camera, 
  PenTool,
  GripVertical
} from "lucide-react";

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file' | 'signature';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormBuilderProps {
  onSave: (formData: any) => void;
  initialData?: any;
}

export function FormBuilder({ onSave, initialData }: FormBuilderProps) {
  const [formName, setFormName] = useState(initialData?.name || "");
  const [formDescription, setFormDescription] = useState(initialData?.description || "");
  const [formType, setFormType] = useState(initialData?.formType || "recurring");
  const [requiresApproval, setRequiresApproval] = useState(initialData?.requiresApproval || false);
  const [fields, setFields] = useState<FormField[]>(initialData?.formFields || []);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      placeholder: type === 'text' ? 'Enter text...' : undefined,
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(field => field.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === fields.length - 1)
    ) {
      return;
    }

    const newFields = [...fields];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    setFields(newFields);
  };

  const handleSave = () => {
    const formData = {
      name: formName,
      description: formDescription,
      formType,
      requiresApproval,
      formFields: fields
    };
    onSave(formData);
  };

  const fieldTypeIcons = {
    text: Type,
    textarea: AlignLeft,
    select: ChevronDown,
    checkbox: Checkbox,
    file: Camera,
    signature: PenTool
  };

  const fieldTypeLabels = {
    text: 'Text Field',
    textarea: 'Text Area',
    select: 'Dropdown',
    checkbox: 'Checkbox',
    file: 'File Upload',
    signature: 'Digital Signature'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Settings */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formName">Form Name</Label>
              <Input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formDescription">Description</Label>
              <Textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formType">Form Type</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring">Recurring Form</SelectItem>
                  <SelectItem value="one_time">One-time Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresApproval"
                checked={requiresApproval}
                onCheckedChange={setRequiresApproval}
              />
              <Label htmlFor="requiresApproval">Requires Approval</Label>
            </div>
          </CardContent>
        </Card>

        {/* Field Types */}
        <Card>
          <CardHeader>
            <CardTitle>Add Field</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(fieldTypeIcons).map(([type, Icon]) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addField(type as FormField['type'])}
                  className="justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {fieldTypeLabels[type as keyof typeof fieldTypeLabels]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Preview */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {formName && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{formName}</h3>
                {formDescription && (
                  <p className="text-sm text-gray-600 mt-1">{formDescription}</p>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={formType === 'recurring' ? 'default' : 'secondary'}>
                    {formType === 'recurring' ? 'Recurring' : 'One-time'}
                  </Badge>
                  {requiresApproval && (
                    <Badge variant="outline">Requires Approval</Badge>
                  )}
                </div>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No fields added yet</p>
                  <p className="text-sm">Add fields using the buttons on the left</p>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div key={field.id} className="group relative border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="font-medium"
                            placeholder="Field label"
                          />
                          <Badge variant="outline">
                            {fieldTypeLabels[field.type]}
                          </Badge>
                        </div>
                        
                        {field.type === 'text' && (
                          <Input
                            placeholder={field.placeholder}
                            disabled
                            className="bg-gray-50"
                          />
                        )}
                        
                        {field.type === 'textarea' && (
                          <Textarea
                            placeholder="Enter your response..."
                            disabled
                            className="bg-gray-50"
                            rows={3}
                          />
                        )}
                        
                        {field.type === 'select' && (
                          <Select disabled>
                            <SelectTrigger className="bg-gray-50">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </Select>
                        )}
                        
                        {field.type === 'checkbox' && (
                          <div className="flex items-center space-x-2">
                            <Checkbox disabled />
                            <Label>Checkbox option</Label>
                          </div>
                        )}
                        
                        {field.type === 'file' && (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                            <Camera className="h-6 w-6 mx-auto mb-2" />
                            <p className="text-sm">Upload file</p>
                          </div>
                        )}
                        
                        {field.type === 'signature' && (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                            <PenTool className="h-6 w-6 mx-auto mb-2" />
                            <p className="text-sm">Digital signature</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${field.id}`}
                              checked={field.required}
                              onCheckedChange={(checked) => 
                                updateField(field.id, { required: !!checked })
                              }
                            />
                            <Label htmlFor={`required-${field.id}`} className="text-sm">
                              Required
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveField(field.id, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveField(field.id, 'down')}
                          disabled={index === fields.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Button 
          onClick={handleSave} 
          className="w-full bg-maritime-600 hover:bg-maritime-700"
          disabled={!formName || fields.length === 0}
        >
          Save Form
        </Button>
      </div>
    </div>
  );
}
