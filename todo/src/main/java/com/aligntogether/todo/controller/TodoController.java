package com.aligntogether.todo.controller;

import com.aligntogether.todo.model.Todo;
import com.aligntogether.todo.model.User;
import com.aligntogether.todo.repository.TodoRepository;;
import com.aligntogether.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    // Helper to get authenticated user
    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @GetMapping
    public ResponseEntity<List<Todo>> getTodos(Authentication authentication, @RequestParam(required = false) String status) {
        User user = getUser(authentication);
        if (status != null && !status.isEmpty() && !status.equals("All")) {
            return ResponseEntity.ok(todoRepository.findByUserAndStatus(user, status));
        }
        return ResponseEntity.ok(todoRepository.findByUser(user));
    }

    @PostMapping
    public ResponseEntity<Todo> createTodo(@RequestBody Todo todo, Authentication authentication) {
        User user = getUser(authentication);
        todo.setUser(user);
        // Ensure defaults
        if (todo.getStatus() == null) todo.setStatus("Pending");
        if (todo.getCreatedAt() == null) todo.setCreatedAt(java.time.LocalDateTime.now());

        return ResponseEntity.ok(todoRepository.save(todo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todoDetails, Authentication authentication) {
        User user = getUser(authentication);
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found"));

        // Strict Ownership Check
        if (!todo.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }

        todo.setTitle(todoDetails.getTitle());
        todo.setDescription(todoDetails.getDescription());
        todo.setStatus(todoDetails.getStatus());
        return ResponseEntity.ok(todoRepository.save(todo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id, Authentication authentication) {
        User user = getUser(authentication);
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found"));

        // Strict Ownership Check
        if (!todo.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }

        todoRepository.delete(todo);
        return ResponseEntity.noContent().build();
    }
}