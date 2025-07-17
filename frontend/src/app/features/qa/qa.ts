import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

interface QAMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface QAResponse {
  question: string;
  answer: string;
  relevant_documents: string[];
  confidence: number;
}

@Component({
  selector: 'app-qa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './qa.html',
  styleUrl: './qa.scss'
})
export class QaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);
  
  questionForm: FormGroup;
  
  // Use signals for reactive state
  messages = signal<QAMessage[]>([]);
  isAsking = signal(false);

  constructor() {
    this.questionForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit() {}

  async askQuestion() {
    if (this.questionForm.valid && !this.isAsking()) {
      const question = this.questionForm.get('question')?.value;
      
      // Add user question to messages
      const userMessage: QAMessage = {
        id: Date.now().toString(),
        question: question,
        answer: '',
        timestamp: new Date()
      };
      
      this.messages.update(messages => [...messages, userMessage]);
      
      // Add assistant response placeholder
      const assistantMessage: QAMessage = {
        id: (Date.now() + 1).toString(),
        question: '',
        answer: '',
        timestamp: new Date(),
        isLoading: true
      };
      
      this.messages.update(messages => [...messages, assistantMessage]);
      
      // Clear form
      this.questionForm.reset();
      this.isAsking.set(true);
      
      try {
        // Make real API call to backend
        const response = await this.http.post<QAResponse>('http://localhost:3000/api/qa/ask', {
          question: question,
          documentIds: [] // Empty array means search all ingested documents
        }).toPromise();
        
        // Update assistant message with real response
        this.messages.update(messages => 
          messages.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, answer: response.answer, isLoading: false }
              : msg
          )
        );
      } catch (error) {
        console.error('Q&A API error:', error);
        this.snackBar.open('Error getting answer. Please try again.', 'Close', { duration: 3000 });
        
        // Update assistant message with error
        this.messages.update(messages => 
          messages.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, answer: 'Sorry, I encountered an error while processing your question. Please try again.', isLoading: false }
              : msg
          )
        );
      } finally {
        this.isAsking.set(false);
      }
    }
  }

  onEnterPress(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.askQuestion();
    }
  }
} 