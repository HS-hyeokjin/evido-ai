package com.evido.api.document.repository;

import com.evido.api.document.entity.FileObject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileObjectRepository extends JpaRepository<FileObject, Long> {
}
