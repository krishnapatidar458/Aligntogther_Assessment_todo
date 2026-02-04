package com.aligntogether.todo.repository;

import com.aligntogether.todo.model.Todo;
import com.aligntogether.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    // Ensures users only see their own todos
    List<Todo> findByUser(User user);
    List<Todo> findByUserAndStatus(User user, String status);
}